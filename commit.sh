#!/bin/bash

# ============================================================================
# ADVANCED GIT COMMIT MANAGER v4.1
# AI-Powered · Conventional Commits 1.0.0 · Angular Style · Strict
# ============================================================================

# NOTE: Do NOT use set -e here — grep -c legitimately returns 1 on no-match
set -uo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
GEMINI_API_KEY="${GEMINI_API_KEY:-AIzaSyDTPSn7AQuTZ5lhDe80s8YFx_SYkoILJq4}"
GEMINI_MODEL="gemini-1.5-flash"
GEMINI_ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent"
CACHE_DIR=".git/.commit-manager"
LOG_FILE="${CACHE_DIR}/history.log"
MAX_SUBJECT_LENGTH=72
MAX_BODY_LINE_LENGTH=100
DIFF_CONTEXT_LINES=8
VERSION="4.1.0"

# ── ANSI Colors ───────────────────────────────────────────────────────────────
RED='\033[0;31m';    GREEN='\033[0;32m';   YELLOW='\033[1;33m'
BLUE='\033[0;34m';   PURPLE='\033[0;35m';  CYAN='\033[0;36m'
WHITE='\033[1;37m';  GRAY='\033[0;90m';    BOLD='\033[1m';  NC='\033[0m'

# ── Print Helpers ─────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}  ->$NC $1"; }
success() { echo -e "${GREEN}  v$NC $1"; }
warn()    { echo -e "${YELLOW}  !$NC $1"; }
error()   { echo -e "${RED}  x$NC $1" >&2; }
dim()     { echo -e "${GRAY}    $1${NC}"; }

header() {
    local title="$1"
    local line
    line=$(printf '=%.0s' $(seq 1 62))
    echo ""
    echo -e "${PURPLE}+${line}+${NC}"
    printf "${PURPLE}|${NC}  ${BOLD}%-62s${NC}${PURPLE}|${NC}\n" "$title"
    echo -e "${PURPLE}+${line}+${NC}"
    echo ""
}

separator() { echo -e "${GRAY}$(printf -- '-%.0s' $(seq 1 64))${NC}"; }

# ── Dependency Check ──────────────────────────────────────────────────────────
check_dependencies() {
    local missing=()
    for cmd in git curl jq awk sed grep wc; do
        command -v "$cmd" &>/dev/null || missing+=("$cmd")
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing: ${missing[*]} -- install with: sudo apt-get install ${missing[*]}"
        exit 1
    fi
    if ! git rev-parse --is-inside-work-tree &>/dev/null; then
        error "Not inside a git repository."
        exit 1
    fi
    mkdir -p "$CACHE_DIR"
    touch "$LOG_FILE"
}

# ── Git Diff Extraction ───────────────────────────────────────────────────────
get_rich_diff() {
    local file="$1"
    local change_type="$2"
    local diff=""

    case "$change_type" in
        deleted)
            diff=$(git show "HEAD:${file}" 2>/dev/null | head -300 | sed 's/^/-/')
            ;;
        new)
            diff=$(git diff --cached --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null)
            if [[ -z "$diff" ]]; then
                diff=$(git diff --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null)
            fi
            if [[ -z "$diff" ]] && [[ -f "$file" ]]; then
                diff=$(head -300 "$file" | sed 's/^/+/')
            fi
            ;;
        *)
            diff=$(git diff --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null)
            if [[ -z "$diff" ]]; then
                diff=$(git diff --cached --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null)
            fi
            ;;
    esac

    echo "$diff"
}

# Safe count — never returns empty string, never crashes on no-match
safe_count() {
    local pattern="$1"
    local text="$2"
    local n
    n=$(printf '%s' "$text" | grep -c "$pattern" 2>/dev/null) || n=0
    printf '%d' "${n:-0}"
}

# ── File Intelligence Extractor ───────────────────────────────────────────────
extract_file_intelligence() {
    local file="$1"
    local diff="$2"

    local ext basename name_no_ext dir
    ext="${file##*.}"
    basename="${file##*/}"
    name_no_ext="${basename%.*}"
    dir="${file%/*}"
    [[ "$dir" == "$file" ]] && dir="root"

    # Language detection
    local lang="unknown"
    case "$ext" in
        ts|tsx)         lang="TypeScript" ;;
        js|jsx|mjs)     lang="JavaScript" ;;
        py)             lang="Python" ;;
        go)             lang="Go" ;;
        rs)             lang="Rust" ;;
        java)           lang="Java" ;;
        rb)             lang="Ruby" ;;
        php)            lang="PHP" ;;
        cs)             lang="C#" ;;
        cpp|cc|cxx)     lang="C++" ;;
        c)              lang="C" ;;
        md|mdx)         lang="Markdown" ;;
        json)           lang="JSON" ;;
        yml|yaml)       lang="YAML" ;;
        sql)            lang="SQL" ;;
        sh|bash)        lang="Shell" ;;
        css|scss|sass)  lang="CSS/SCSS" ;;
        html|htm)       lang="HTML" ;;
        proto)          lang="Protobuf" ;;
        tf|tfvars)      lang="Terraform" ;;
        dart)           lang="Dart" ;;
        swift)          lang="Swift" ;;
        kt)             lang="Kotlin" ;;
        xml)            lang="XML" ;;
        toml)           lang="TOML" ;;
        lock)           lang="Lockfile" ;;
    esac

    # Pattern/framework detection from path
    local framework=""
    [[ "$file" =~ \.(test|spec)\. ]]                             && framework="Test"
    [[ "$file" =~ __tests__ ]]                                   && framework="Test"
    [[ "$file" =~ (Component|\.vue|\.svelte) ]]                  && framework="Component"
    [[ "$file" =~ [Ss]ervice ]]                                  && framework="Service"
    [[ "$file" =~ [Cc]ontroller ]]                               && framework="Controller"
    [[ "$file" =~ (use[A-Z]|[Hh]ook) ]]                         && framework="Hook"
    [[ "$file" =~ [Mm]iddleware ]]                               && framework="Middleware"
    [[ "$file" =~ ([Mm]odel|[Ss]chema|[Ee]ntity) ]]             && framework="Model"
    [[ "$file" =~ ([Rr]outer|[Rr]oute|[Pp]age) ]]               && framework="Router"
    [[ "$file" =~ ([Uu]til|[Hh]elper|[Ll]ib) ]]                 && framework="Utility"
    [[ "$file" =~ ([Ss]tore|[Ss]lice|[Rr]educer|[Cc]ontext) ]] && framework="State"
    [[ "$file" =~ ([Cc]onfig|\.env) ]]                           && framework="Config"
    [[ "$file" =~ [Mm]igration ]]                                && framework="Migration"
    [[ "$file" =~ (Dockerfile|docker-compose) ]]                 && framework="Docker"
    [[ "$file" =~ (\.github|\.gitlab|[Cc][Ii]) ]]               && framework="CI/CD"
    [[ "$file" =~ [Dd][Tt][Oo] ]]                               && framework="DTO"
    [[ "$file" =~ [Rr]epository ]]                              && framework="Repository"

    # Diff stats — fully safe
    local added removed net_change
    added=$(safe_count '^+[^+]' "$diff")
    removed=$(safe_count '^-[^-]' "$diff")
    net_change=$(( added - removed ))

    # Symbol extraction
    local changed_funcs changed_classes changed_exports changed_imports
    changed_funcs=$(printf '%s' "$diff" | grep -E '^\+[^+].*(function |def |func |fn |async )' 2>/dev/null \
        | grep -oE '(function |def |func |fn |async )[a-zA-Z_][a-zA-Z0-9_]*' \
        | awk '{print $NF}' | sort -u | head -8 | tr '\n' ', ' | sed 's/, *$//' || true)
    changed_classes=$(printf '%s' "$diff" | grep -E '^\+[^+].*(class |interface |type |enum )' 2>/dev/null \
        | grep -oE '(class |interface |type |enum )[a-zA-Z_][a-zA-Z0-9_]*' \
        | awk '{print $NF}' | sort -u | head -5 | tr '\n' ', ' | sed 's/, *$//' || true)
    changed_exports=$(safe_count '^+[^+].*export ' "$diff")
    changed_imports=$(safe_count '^+[^+].*import ' "$diff")

    # Breaking change detection
    local breaking_signals=""
    printf '%s' "$diff" | grep -qE '^\-.*export (default |const |function |class )' 2>/dev/null \
        && breaking_signals="removed-public-export"
    printf '%s' "$diff" | grep -qE '^\-.*\b(interface|type)\b.*\{' 2>/dev/null \
        && breaking_signals="${breaking_signals:+${breaking_signals}, }changed-interface"

    # Git history
    local last_commit_msg commit_count related_files
    last_commit_msg=$(git log -1 --pretty="%s" -- "$file" 2>/dev/null || true)
    commit_count=$(git log --oneline -- "$file" 2>/dev/null | wc -l | tr -d ' ' || true)
    commit_count="${commit_count:-0}"
    related_files=$(git log -5 --name-only --pretty="" -- "$file" 2>/dev/null \
        | grep -v "^$" | grep -v "^${file}$" | sort -u | head -5 \
        | tr '\n' ', ' | sed 's/, *$//' || true)

    # Output JSON — all values guaranteed non-empty via shell defaults
    jq -n \
        --arg file        "$file" \
        --arg basename    "$basename" \
        --arg name        "$name_no_ext" \
        --arg dir         "$dir" \
        --arg ext         "$ext" \
        --arg lang        "$lang" \
        --arg framework   "${framework:-}" \
        --argjson added   "${added:-0}" \
        --argjson removed "${removed:-0}" \
        --argjson net     "${net_change:-0}" \
        --arg funcs       "${changed_funcs:-}" \
        --arg classes     "${changed_classes:-}" \
        --argjson exports "${changed_exports:-0}" \
        --argjson imports "${changed_imports:-0}" \
        --arg breaking    "${breaking_signals:-}" \
        --arg last_msg    "${last_commit_msg:-}" \
        --argjson count   "${commit_count:-0}" \
        --arg related     "${related_files:-}" \
        '{
            file: $file, basename: $basename, name: $name,
            directory: $dir, extension: $ext, language: $lang,
            framework: $framework,
            stats: { added: $added, removed: $removed, net_change: $net },
            symbols: {
                functions: $funcs, classes: $classes,
                exports_changed: $exports, imports_changed: $imports
            },
            breaking_signals: $breaking,
            history: {
                last_message: $last_msg, commit_count: $count,
                related_files: $related
            }
        }' 2>/dev/null || echo '{}'
}

# ── Scope Resolver ────────────────────────────────────────────────────────────
determine_scope() {
    local file="$1"
    local scope=""

    # Monorepo: top-level dir has its own package.json
    local top_dir="${file%%/*}"
    if [[ -f "${top_dir}/package.json" ]] && [[ "$top_dir" != "$file" ]]; then
        local pkg_name
        pkg_name=$(jq -r '.name // empty' "${top_dir}/package.json" 2>/dev/null \
            | sed 's|@[^/]*/||')
        [[ -n "$pkg_name" ]] && scope="$pkg_name"
    fi

    # Path-based scope detection
    if [[ -z "$scope" ]]; then
        local depth
        depth=$(printf '%s' "$file" | tr -cd '/' | wc -c)

        if [[ $depth -ge 3 ]]; then
            # e.g. client/src/components/shared/members/MemberList.tsx -> members
            scope=$(echo "$file" | awk -F'/' '{print $(NF-1)}')
        elif [[ $depth -ge 2 ]]; then
            # e.g. src/auth/login.ts -> auth
            scope=$(echo "$file" | awk -F'/' '{print $2}')
        else
            # Top-level file: use name without extension
            scope=$(echo "$file" | awk -F'/' '{print $NF}' | sed 's/\.[^.]*$//')
        fi
    fi

    # Normalize
    scope=$(echo "$scope" \
        | tr '[:upper:]' '[:lower:]' \
        | sed 's/[^a-z0-9-]/-/g' \
        | sed 's/--*/-/g' \
        | sed 's/^-//;s/-$//')

    # Avoid generic path segments as scope
    case "$scope" in
        src|lib|app|apps|packages|modules|components|shared|common|utils|helpers|test|tests|root|"")
            local parent
            parent=$(echo "$file" | awk -F'/' 'NF>=2{print $(NF-1)}' \
                | tr '[:upper:]' '[:lower:]' \
                | sed 's/[^a-z0-9-]/-/g')
            [[ -n "$parent" ]] && scope="$parent" \
                || scope=$(basename "$file" | sed 's/\.[^.]*$//')
            ;;
    esac

    echo "${scope:-app}"
}

# ── Gemini API Call ───────────────────────────────────────────────────────────
call_gemini() {
    local prompt="$1"
    local temperature="${2:-0.2}"
    local max_tokens="${3:-1200}"

    local payload
    payload=$(jq -n \
        --arg text     "$prompt" \
        --argjson temp "$temperature" \
        --argjson tok  "$max_tokens" \
        '{
            contents: [{ parts: [{ text: $text }] }],
            generationConfig: {
                temperature: $temp,
                maxOutputTokens: $tok,
                topP: 0.85,
                topK: 40
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        }')

    local response
    response=$(curl -sf \
        --max-time 30 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}" 2>/dev/null) || {
            echo "GEMINI_ERROR"
            return 1
        }

    local api_err
    api_err=$(echo "$response" | jq -r '.error.message // empty' 2>/dev/null)
    if [[ -n "$api_err" ]]; then
        warn "Gemini API: $api_err"
        echo "GEMINI_ERROR"
        return 1
    fi

    local result
    result=$(echo "$response" | jq -r '.candidates[0].content.parts[0].text // "GEMINI_ERROR"')
    echo "$result"
}

# ── Commit Message Generator ──────────────────────────────────────────────────
generate_commit_message() {
    local intel_json="$1"
    local diff="$2"
    local change_type="$3"

    local file lang framework added removed funcs classes breaking last_msg related
    file=$(echo "$intel_json"      | jq -r '.file')
    lang=$(echo "$intel_json"      | jq -r '.language')
    framework=$(echo "$intel_json" | jq -r '.framework')
    added=$(echo "$intel_json"     | jq -r '.stats.added')
    removed=$(echo "$intel_json"   | jq -r '.stats.removed')
    funcs=$(echo "$intel_json"     | jq -r '.symbols.functions')
    classes=$(echo "$intel_json"   | jq -r '.symbols.classes')
    breaking=$(echo "$intel_json"  | jq -r '.breaking_signals')
    last_msg=$(echo "$intel_json"  | jq -r '.history.last_message')
    related=$(echo "$intel_json"   | jq -r '.history.related_files')

    local scope
    scope=$(determine_scope "$file" "$intel_json")

    local diff_excerpt
    diff_excerpt=$(echo "$diff" | head -200)

    # Build prompt using printf to avoid heredoc escaping issues
    local prompt
    prompt=$(printf '%s' \
"You are a senior software engineer writing a git commit message.

TASK: Analyze the diff below and write a professional commit message that:
- Strictly follows Conventional Commits 1.0.0
- Explains clearly WHY the change was made (not just what)
- Is specific, technical, and never vague
- Is written as an expert developer would write it

FILE CONTEXT:
  Path      : ${file}
  Language  : ${lang}
  Pattern   : ${framework:-general}
  Change    : ${change_type}
  Stats     : +${added} / -${removed} lines
  Functions : ${funcs:-none detected}
  Classes   : ${classes:-none detected}
  Breaking  : ${breaking:-none}
  Last msg  : ${last_msg:-first commit on this file}
  Related   : ${related:-none}

DIFF:
${diff_excerpt}

REQUIRED FORMAT:
<type>(<scope>): <subject>

<body>

<footer — only if breaking change or issue ref>

TYPE OPTIONS: feat | fix | refactor | perf | test | build | ci | docs | style | chore | security | revert

SCOPE: Use '${scope}' unless the diff clearly shows a more specific module name.

SUBJECT LINE RULES:
- Imperative present tense: 'add' not 'added'
- All lowercase first word
- No period at end
- Max 72 characters
- Must describe WHAT changed specifically (name the component, function, or behavior)
- FORBIDDEN words in subject: update, fix, change, modify, misc, various, stuff, some, things

BODY RULES (MANDATORY — minimum 3 lines):
- Blank line after subject
- Line 1: describe the PROBLEM or NEED that motivated this change
- Line 2-4: describe WHAT was changed and WHY this approach was chosen
- Use '- ' bullet points for listing multiple changes
- Name specific methods, classes, or patterns visible in the diff
- Mention side effects or dependencies if any
- Wrap at 100 chars per line

FOOTER: Add 'BREAKING CHANGE: <impact and migration>' if breaking signals exist.
Add 'Closes #N' only if an issue number is referenced in the diff.

CONCRETE EXAMPLE OF THE QUALITY EXPECTED:

refactor(members): extract member filter logic into a dedicated hook

MemberList was accumulating too much state management logic alongside
its rendering concerns, making it difficult to test filter behavior in
isolation and reuse the logic across other views.

Extracted all filter state (search term, district selector, status
toggle) into useMemberFilters. The hook handles debouncing, URL param
sync, and filter reset. MemberList now only consumes the derived list.

- Add useMemberFilters with unit tests for each filter case
- Remove local useState calls for filter fields from MemberList
- Keep pagination state in MemberList (view-specific concern)
- No API contract changes

OUTPUT INSTRUCTION:
Return ONLY the raw commit message.
No markdown code fences, no explanation, no preamble.
Your response must start with the commit type (e.g. 'feat', 'fix', 'refactor').")

    local message
    message=$(call_gemini "$prompt" 0.2 1200)

    if [[ "$message" == "GEMINI_ERROR" ]] || [[ -z "$message" ]] || [[ "$message" == "null" ]]; then
        warn "Gemini unavailable — using intelligent fallback"
        generate_fallback_message "$intel_json" "$change_type" "$scope"
        return
    fi

    # Strip accidental markdown fences
    message=$(echo "$message" | sed '/^```/d' | sed '/^`$/d')
    # Trim leading blank lines
    message=$(echo "$message" | sed '/./,$!d')

    # Subject line length guard
    local subject_line
    subject_line=$(echo "$message" | head -1)
    if [[ ${#subject_line} -gt $MAX_SUBJECT_LENGTH ]]; then
        warn "Subject too long (${#subject_line} chars) — trimming..."
        local trim_prompt
        trim_prompt="Shorten this commit subject to under 72 characters. Keep the conventional commit format. Keep it specific. Return ONLY the subject line.

Original: ${subject_line}"
        local shortened
        shortened=$(call_gemini "$trim_prompt" 0.1 100)
        if [[ "$shortened" != "GEMINI_ERROR" ]] && [[ -n "$shortened" ]]; then
            message=$(echo "$message" | awk -v s="$shortened" 'NR==1{print s;next}{print}')
        fi
    fi

    echo "$message"
}

# ── Intelligent Fallback ──────────────────────────────────────────────────────
generate_fallback_message() {
    local intel="$1"
    local change_type="$2"
    local scope="$3"

    local file name lang framework added removed funcs classes ext
    file=$(echo "$intel"      | jq -r '.file')
    name=$(echo "$intel"      | jq -r '.name')
    lang=$(echo "$intel"      | jq -r '.language')
    framework=$(echo "$intel" | jq -r '.framework')
    added=$(echo "$intel"     | jq -r '.stats.added')
    removed=$(echo "$intel"   | jq -r '.stats.removed')
    funcs=$(echo "$intel"     | jq -r '.symbols.functions')
    classes=$(echo "$intel"   | jq -r '.symbols.classes')
    ext=$(echo "$intel"       | jq -r '.extension')

    local type="chore"
    [[ "$framework" == "Test" ]]                                  && type="test"
    [[ "$framework" == "CI/CD" ]]                                 && type="ci"
    [[ "$framework" == "Migration" ]]                             && type="build"
    [[ "$ext" =~ ^(md|mdx|rst|txt)$ ]]                           && type="docs"
    [[ "$ext" =~ ^(json|yml|yaml|toml)$ ]]                       && type="build"
    [[ "$ext" =~ ^(sh|bash)$ ]]                                   && type="ci"
    [[ "$change_type" == "deleted" ]]                             && type="refactor"
    [[ "${added:-0}" -gt 60 && "${removed:-0}" -lt 5 ]]          && type="feat"
    [[ "${removed:-0}" -gt "${added:-0}" ]]                       && type="refactor"

    local target="${framework:+${lang} ${framework}}"
    target="${target:-${lang} module}"

    local subject="${type}(${scope}): "
    case "$type" in
        feat)     subject+="add ${name} to ${target,,}" ;;
        fix)      subject+="correct behavior in ${name} ${target,,}" ;;
        refactor) subject+="restructure ${name} for better maintainability" ;;
        docs)     subject+="document ${name} usage and configuration" ;;
        test)     subject+="add unit tests for ${name}" ;;
        build)    subject+="update ${name} build configuration" ;;
        ci)       subject+="configure ${name} pipeline step" ;;
        chore)    subject+="clean up ${name} ${target,,}" ;;
        *)        subject+="rework ${name} ${target,,}" ;;
    esac

    local net=$(( ${added:-0} - ${removed:-0} ))
    local body="The ${name} ${target,,} required maintenance to align with current standards."
    body+="\n"

    if [[ "$change_type" == "deleted" ]]; then
        body+="\nRemove ${name} as it is no longer referenced by any consumer."
        body+="\n- Deleted ${removed:-0} lines of obsolete code"
    elif [[ $net -gt 0 ]]; then
        body+="\nExpand ${name} with additional logic to handle new requirements (+${net} net lines)."
        [[ -n "$funcs" ]]   && body+="\n- Functions modified: ${funcs}"
        [[ -n "$classes" ]] && body+="\n- Types affected: ${classes}"
    else
        body+="\nSimplify ${name} by removing redundant code and consolidating logic."
        [[ -n "$funcs" ]]   && body+="\n- Functions refactored: ${funcs}"
        [[ -n "$classes" ]] && body+="\n- Types updated: ${classes}"
    fi

    body+="\n\nNo breaking changes to public interfaces."

    printf '%s\n\n%b\n' "$subject" "$body"
}

# ── Commit Message Validator ──────────────────────────────────────────────────
validate_commit_message() {
    local msg="$1"
    local valid=true

    local subject
    subject=$(echo "$msg" | head -1)

    if ! echo "$subject" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\([^)]+\))?(!)?: .{3,}'; then
        error "INVALID: subject must match type(scope): description"
        valid=false
    fi

    if [[ ${#subject} -gt $MAX_SUBJECT_LENGTH ]]; then
        error "INVALID: subject is ${#subject} chars (max ${MAX_SUBJECT_LENGTH})"
        valid=false
    fi

    local line2
    line2=$(echo "$msg" | sed -n '2p')
    if [[ -n "$line2" ]]; then
        error "INVALID: line 2 must be blank — found: '${line2}'"
        valid=false
    fi

    local desc
    desc=$(echo "$subject" | sed -E 's/^[a-z]+(\([^)]+\))?!?: //')
    if echo "$desc" | grep -qiE '^(added|fixed|updated|changed|removed|deleted|created|modified)'; then
        warn "WARNING: use imperative mood — 'add' not 'added'"
    fi

    if echo "$subject" | grep -qiE '\b(update|fix|change|modify|misc|various|stuff|things|some)\b'; then
        warn "WARNING: subject is too vague — name the specific component or behavior"
    fi

    local line_count
    line_count=$(echo "$msg" | wc -l)
    if [[ $line_count -lt 3 ]]; then
        warn "WARNING: body is missing — explain WHY the change was made"
    fi

    if $valid; then
        success "Message passes all validation checks"
    fi

    $valid
}

# ── Commit Preview Display ────────────────────────────────────────────────────
display_commit_preview() {
    local msg="$1"
    local intel="$2"

    local file lang framework added removed
    file=$(echo "$intel"      | jq -r '.file')
    lang=$(echo "$intel"      | jq -r '.language')
    framework=$(echo "$intel" | jq -r '.framework')
    added=$(echo "$intel"     | jq -r '.stats.added')
    removed=$(echo "$intel"   | jq -r '.stats.removed')

    local scope
    scope=$(determine_scope "$file" "$intel")

    separator
    echo -e "  ${BOLD}COMMIT PREVIEW${NC}"
    separator
    echo ""

    local line_num=0
    while IFS= read -r line; do
        line_num=$(( line_num + 1 ))
        if [[ $line_num -eq 1 ]]; then
            echo -e "  ${CYAN}${BOLD}${line}${NC}"
        elif [[ $line_num -eq 2 ]]; then
            echo ""
        else
            if echo "$line" | grep -qE '^(BREAKING CHANGE|Closes|Refs|Co-authored-by):'; then
                echo -e "  ${YELLOW}${line}${NC}"
            else
                echo -e "  ${WHITE}${line}${NC}"
            fi
        fi
    done <<< "$msg"

    echo ""
    separator
    echo -e "  ${GRAY}${lang}${framework:+ / ${framework}} | +${added}/-${removed} | scope: ${scope} | ${file}${NC}"
    separator
}

# ── Single File Processing ────────────────────────────────────────────────────
process_file() {
    local file="$1"
    local change_type="$2"
    local index="$3"
    local total="$4"
    local commit_timestamp="$5"

    header "[${index}/${total}]  ${file}"

    info "Analyzing changes..."
    local diff
    diff=$(get_rich_diff "$file" "$change_type")

    if [[ -z "$diff" ]] && [[ "$change_type" != "deleted" ]]; then
        if [[ -f "$file" ]]; then
            diff=$(head -200 "$file" | sed 's/^/+/')
            info "No git diff found — using raw file content as context"
        else
            warn "No diff and file not found — skipping ${file}"
            return 0
        fi
    fi

    info "Extracting code intelligence..."
    local intel
    intel=$(extract_file_intelligence "$file" "$diff")

    local lang framework added removed
    lang=$(echo "$intel"      | jq -r '.language')
    framework=$(echo "$intel" | jq -r '.framework')
    added=$(echo "$intel"     | jq -r '.stats.added')
    removed=$(echo "$intel"   | jq -r '.stats.removed')

    echo -e "  ${CYAN}Language:${NC}  ${lang}${framework:+ (${framework})}"
    echo -e "  ${CYAN}Changes:${NC}   ${GREEN}+${added}${NC} / ${RED}-${removed}${NC} lines"
    echo ""

    info "Generating commit message with Gemini AI..."
    local commit_msg
    commit_msg=$(generate_commit_message "$intel" "$diff" "$change_type")

    local attempts=0
    while true; do
        attempts=$(( attempts + 1 ))

        display_commit_preview "$commit_msg" "$intel"
        echo ""
        validate_commit_message "$commit_msg" 2>&1 | sed 's/^/  /'
        echo ""

        echo -e "  ${BOLD}Actions:${NC}"
        echo -e "  ${GREEN}[c]${NC} Commit with this message"
        echo -e "  ${YELLOW}[e]${NC} Edit in \$EDITOR (nano by default)"
        echo -e "  ${BLUE}[r]${NC} Regenerate with Gemini AI"
        echo -e "  ${CYAN}[d]${NC} Show full diff"
        echo -e "  ${CYAN}[i]${NC} Show file intelligence"
        echo -e "  ${GRAY}[s]${NC} Skip this file"
        echo -e "  ${RED}[q]${NC} Quit"
        echo ""
        read -rp "  -> " choice
        echo ""

        case "${choice,,}" in
            c) break ;;

            e)
                local tmpfile
                tmpfile=$(mktemp /tmp/commit-XXXXXX.txt)
                printf '%s\n' "$commit_msg" > "$tmpfile"
                cat >> "$tmpfile" << 'GUIDE'

# ─── Commit Message Guidelines ─────────────────────────────────────────
# Format : <type>(<scope>): <subject>
#          <blank line>
#          <body — explain WHY, 3+ lines, wrap at 100 chars>
#          <blank line>
#          <footer — BREAKING CHANGE: ... | Closes #N>
#
# Types  : feat | fix | docs | style | refactor | perf | test
#          build | ci | chore | revert | security
#
# Rules  : imperative mood | max 72 chars subject | no period at end
#          body REQUIRED | be specific | no vague words
# ───────────────────────────────────────────────────────────────────────
GUIDE
                ${EDITOR:-nano} "$tmpfile"
                commit_msg=$(grep -v '^#' "$tmpfile" | sed '/./,$!d')
                rm -f "$tmpfile"
                ;;

            r)
                info "Regenerating (attempt ${attempts})..."
                commit_msg=$(generate_commit_message "$intel" "$diff" "$change_type")
                ;;

            d)
                echo ""
                echo -e "${CYAN}  Full diff -- ${file}:${NC}"
                separator
                local lc=0
                while IFS= read -r l; do
                    lc=$(( lc + 1 ))
                    case "${l:0:1}" in
                        +) echo -e "${GREEN}${l}${NC}" ;;
                        -) echo -e "${RED}${l}${NC}" ;;
                        @) echo -e "${CYAN}${l}${NC}" ;;
                        *) echo -e "${GRAY}${l}${NC}" ;;
                    esac
                    [[ $lc -ge 300 ]] && { dim "... truncated ($(echo "$diff" | wc -l) total lines)"; break; }
                done <<< "$diff"
                echo ""
                read -rp "  Press Enter..." _x
                ;;

            i)
                echo ""
                echo -e "${CYAN}  File Intelligence:${NC}"
                echo "$intel" | jq '.' | sed 's/^/  /'
                echo ""
                read -rp "  Press Enter..." _x
                ;;

            s)
                warn "Skipped: ${file}"
                return 0
                ;;

            q)
                unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE 2>/dev/null || true
                warn "Quit by user."
                exit 0
                ;;

            *)
                warn "Unknown option '${choice}' -- use c/e/r/d/i/s/q"
                ;;
        esac
    done

    # Stage
    if [[ "$change_type" == "deleted" ]]; then
        git rm --cached "$file" &>/dev/null || git rm -f "$file" &>/dev/null || true
    else
        git add "$file" &>/dev/null
    fi

    # Timestamp
    local commit_date
    commit_date=$(date -d "@${commit_timestamp}" "+%Y-%m-%dT%H:%M:%S" 2>/dev/null \
        || date "+%Y-%m-%dT%H:%M:%S")

    export GIT_AUTHOR_DATE="$commit_date"
    export GIT_COMMITTER_DATE="$commit_date"

    # Commit
    if printf '%s\n' "$commit_msg" | git commit --no-verify -F - &>/dev/null; then
        local short_hash
        short_hash=$(git rev-parse --short HEAD)
        success "Committed: ${short_hash} -- $(echo "$commit_msg" | head -1)"
        printf '%s | %s | %s\n' "$(date -Iseconds)" "$short_hash" "$(echo "$commit_msg" | head -1)" >> "$LOG_FILE"
    else
        error "Git commit failed for ${file}"
        git status --short | sed 's/^/  /'
        return 1
    fi
}

# ── Repository Analyzer ───────────────────────────────────────────────────────
analyze_repo() {
    header "REPOSITORY ANALYSIS"

    local branch remote total_commits contributors
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    remote=$(git remote get-url origin 2>/dev/null || echo "no remote configured")
    total_commits=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    contributors=$(git shortlog -sn --no-merges 2>/dev/null | wc -l | tr -d ' ')

    echo -e "  ${BOLD}Repository:${NC}"
    echo -e "    Branch:        ${CYAN}${branch}${NC}"
    echo -e "    Remote:        ${GRAY}${remote}${NC}"
    echo -e "    Total commits: ${total_commits}"
    echo -e "    Contributors:  ${contributors}"
    echo ""

    echo -e "  ${BOLD}Working Tree:${NC}"
    git status --short 2>/dev/null | head -30 | while IFS= read -r line; do
        local st="${line:0:2}" f="${line:3}"
        case "${st:0:1}" in
            M)  echo -e "  ${YELLOW}modified${NC}   ${f}" ;;
            A)  echo -e "  ${GREEN}added${NC}      ${f}" ;;
            D)  echo -e "  ${RED}deleted${NC}    ${f}" ;;
            R)  echo -e "  ${PURPLE}renamed${NC}    ${f}" ;;
            '?') echo -e "  ${GRAY}untracked${NC}  ${f}" ;;
            *)  echo -e "  ${GRAY}${st}${NC}        ${f}" ;;
        esac
    done
    echo ""

    echo -e "  ${BOLD}Recent History:${NC}"
    git log --oneline --graph --decorate -10 2>/dev/null | sed 's/^/    /'
    echo ""

    echo -e "  ${BOLD}Commit Quality (last 10):${NC}"
    local good=0 bad=0
    while IFS= read -r line; do
        if echo "$line" | grep -qE '^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\(.+\))?(!)?:.{5,}'; then
            echo -e "  ${GREEN}OK${NC}  ${line}"
            good=$(( good + 1 ))
        else
            echo -e "  ${RED}NO${NC}  ${line}"
            bad=$(( bad + 1 ))
        fi
    done < <(git log --oneline -10 2>/dev/null)
    echo ""
    echo -e "  Conventional: ${GREEN}${good}/10${NC}  Non-conventional: ${RED}${bad}/10${NC}"
    separator
}

# ── Changed Files Collector ───────────────────────────────────────────────────
get_changed_files() {
    {
        git diff --cached --name-status 2>/dev/null \
            | while IFS=$'\t' read -r st f _r; do echo "$st $f"; done
        git diff --name-status 2>/dev/null \
            | while IFS=$'\t' read -r st f _r; do echo "$st $f"; done
        git ls-files --others --exclude-standard 2>/dev/null \
            | while IFS= read -r f; do echo "? $f"; done
    } | sort -u -k2
}

map_status_to_type() {
    case "${1:0:1}" in
        A|'?') echo "new" ;;
        D)     echo "deleted" ;;
        R)     echo "renamed" ;;
        *)     echo "modified" ;;
    esac
}

# ── Main Commit Workflow ──────────────────────────────────────────────────────
run_commit_workflow() {
    header "COMMIT WORKFLOW -- AI-Powered Professional Commits"

    local -a files=()
    local -a types=()

    while IFS=' ' read -r status file; do
        [[ -z "$file" ]] && continue
        files+=("$file")
        types+=("$(map_status_to_type "$status")")
    done < <(get_changed_files)

    local total=${#files[@]}

    if [[ $total -eq 0 ]]; then
        success "Working tree is clean -- nothing to commit."
        return 0
    fi

    echo -e "  ${BOLD}Detected changes (${total} files):${NC}"
    for i in "${!files[@]}"; do
        case "${types[$i]}" in
            new)     echo -e "  ${GREEN}  +  ${NC}${files[$i]}" ;;
            deleted) echo -e "  ${RED}  -  ${NC}${files[$i]}" ;;
            renamed) echo -e "  ${PURPLE}  >  ${NC}${files[$i]}" ;;
            *)       echo -e "  ${YELLOW}  ~  ${NC}${files[$i]}" ;;
        esac
    done
    echo ""

    # Timestamp config
    local start_timestamp interval=0
    echo -e "  ${BOLD}Timestamps:${NC}"
    echo -e "  [1] Current time (default)"
    echo -e "  [2] Backdate across a date range"
    echo ""
    read -rp "  -> " ts_choice

    if [[ "${ts_choice}" == "2" ]]; then
        local start_str
        read -rp "  Start date (YYYY-MM-DD HH:MM:SS): " start_str
        start_timestamp=$(date -d "$start_str" +%s 2>/dev/null) || {
            error "Invalid date format."
            return 1
        }
        local end_ts
        end_ts=$(date +%s)
        if [[ $total -gt 1 ]]; then
            interval=$(( (end_ts - start_timestamp) / total ))
        else
            interval=3600
        fi
        [[ $interval -lt 300 ]] && interval=300
        info "Spacing ${total} commits every ~$((interval / 60))min from '${start_str}'"
    else
        start_timestamp=$(date +%s)
        interval=0
    fi

    echo ""
    read -rp "  Proceed with ${total} file(s)? [Y/n]: " confirm
    [[ "${confirm,,}" == "n" ]] && return 0

    local current_ts=$start_timestamp
    local ok_count=0

    for i in "${!files[@]}"; do
        if process_file "${files[$i]}" "${types[$i]}" "$(( i + 1 ))" "$total" "$current_ts"; then
            ok_count=$(( ok_count + 1 ))
        fi
        current_ts=$(( current_ts + interval ))
    done

    unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE 2>/dev/null || true

    echo ""
    header "DONE"
    success "${ok_count} / ${total} commits created"
    echo ""
    git log --oneline --graph --decorate -"${ok_count}" 2>/dev/null | sed 's/^/  /'
    echo ""
}

# ── Validate Recent Commits ───────────────────────────────────────────────────
validate_recent() {
    header "COMMIT QUALITY AUDIT"

    local n=20
    read -rp "  How many recent commits to audit? [${n}]: " input_n
    [[ "$input_n" =~ ^[0-9]+$ ]] && n=$input_n

    local good=0 bad=0
    while IFS=' ' read -r hash subject; do
        if echo "${hash} ${subject}" | grep -qE '[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\(.+\))?(!)?: .{5,}'; then
            echo -e "  ${GREEN}OK${NC}  ${GRAY}${hash:0:7}${NC}  ${subject}"
            good=$(( good + 1 ))
        else
            echo -e "  ${RED}NO${NC}  ${GRAY}${hash:0:7}${NC}  ${subject}"
            bad=$(( bad + 1 ))
        fi
    done < <(git log --format="%H %s" -"$n" 2>/dev/null)

    echo ""
    separator
    local total=$(( good + bad ))
    local pct=0
    [[ $total -gt 0 ]] && pct=$(( (good * 100) / total ))
    echo -e "  Score: ${GREEN}${good}${NC} / ${total}  (${pct}%)"
    [[ $pct -lt 80 ]] && warn "Below 80% -- run 'rewrite' to improve recent commits."
    [[ $pct -ge 80 ]] && success "Good commit hygiene."
    separator
}

# ── Rewrite History ───────────────────────────────────────────────────────────
rewrite_history() {
    header "REWRITE COMMIT MESSAGES"
    warn "This rewrites git history. Only do this on unpushed commits."
    echo ""

    local n
    read -rp "  How many recent commits to rewrite? [1-20]: " n
    if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ $n -lt 1 ]] || [[ $n -gt 20 ]]; then
        error "Enter a number between 1 and 20"
        return 1
    fi

    echo ""
    echo -e "  ${BOLD}Commits to rewrite:${NC}"
    git log --oneline -"$n" | sed 's/^/    /'
    echo ""
    read -rp "  Continue? [y/N]: " confirm
    [[ "${confirm,,}" != "y" ]] && return 0

    local backup="backup/rewrite-$(date +%Y%m%d%H%M%S)"
    git branch "$backup" HEAD
    success "Backup branch created: ${backup}"

    local -a hashes=()
    while IFS= read -r line; do
        hashes+=("$(echo "$line" | awk '{print $1}')")
    done < <(git log --oneline -"$n" | tac)

    for hash in "${hashes[@]}"; do
        local old_subject
        old_subject=$(git log -1 --pretty="%s" "$hash" 2>/dev/null)
        echo ""
        echo -e "  ${YELLOW}-- Commit ${hash:0:7}${NC}"
        echo -e "  Old: ${GRAY}${old_subject}${NC}"

        local diff file_changed
        diff=$(git show --no-color -U8 "$hash" 2>/dev/null | tail -n +5 | head -200)
        file_changed=$(git diff-tree --no-commit-id -r --name-only "$hash" 2>/dev/null | head -1)

        if [[ -n "$file_changed" ]]; then
            local intel new_msg
            intel=$(extract_file_intelligence "$file_changed" "$diff")
            new_msg=$(generate_commit_message "$intel" "$diff" "modified")
            echo -e "  New: ${GREEN}$(echo "$new_msg" | head -1)${NC}"
            echo ""
            read -rp "  Apply? [Y/n/e]: " apply
            case "${apply,,}" in
                n) continue ;;
                e)
                    local tmpf
                    tmpf=$(mktemp)
                    printf '%s\n' "$new_msg" > "$tmpf"
                    ${EDITOR:-nano} "$tmpf"
                    new_msg=$(cat "$tmpf")
                    rm -f "$tmpf"
                    ;;
            esac
            local escaped
            escaped=$(printf '%s' "$new_msg" | jq -Rs .)
            git filter-branch -f --msg-filter \
                "if [ \"\$GIT_COMMIT\" = \"${hash}\" ]; then printf '%s' ${escaped}; else cat; fi" \
                "${hash}^..HEAD" &>/dev/null \
                && success "Rewrote ${hash:0:7}" \
                || warn "Could not rewrite ${hash:0:7}"
        fi
    done
}

# ── Main Menu ─────────────────────────────────────────────────────────────────
show_menu() {
    clear
    echo -e "${PURPLE}"
    cat << 'BANNER'
  +============================================================+
  |       ADVANCED GIT COMMIT MANAGER  v4.1                    |
  |       AI-Powered | Conventional Commits | Strict           |
  +============================================================+
BANNER
    echo -e "${NC}"

    local branch pending
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
    pending=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

    echo -e "  ${GRAY}Branch: ${CYAN}${branch}${NC}   ${GRAY}Pending: ${YELLOW}${pending} file(s)${NC}"
    echo ""
    echo -e "  ${BOLD}[1]${NC}  Create commits   -- AI-generated, file by file"
    echo -e "  ${BOLD}[2]${NC}  Analyze repo     -- branch, history, quality"
    echo -e "  ${BOLD}[3]${NC}  Rewrite history  -- improve existing messages"
    echo -e "  ${BOLD}[4]${NC}  Audit quality    -- validate recent commits"
    echo -e "  ${BOLD}[5]${NC}  View log"
    echo -e "  ${BOLD}[q]${NC}  Quit"
    echo ""
}

# ── Entry Point ───────────────────────────────────────────────────────────────
main() {
    check_dependencies

    case "${1:-}" in
        commit|c)   run_commit_workflow; exit 0 ;;
        analyze|a)  analyze_repo;        exit 0 ;;
        validate|v) validate_recent;     exit 0 ;;
        rewrite|r)  rewrite_history;     exit 0 ;;
        --version)  echo "git-commit-manager v${VERSION}"; exit 0 ;;
        --help|-h)
            echo "Usage: ./commit.sh [commit|analyze|validate|rewrite|--version|--help]"
            echo "No argument = interactive menu"
            exit 0
            ;;
    esac

    while true; do
        show_menu
        read -rp "  -> " choice
        echo ""
        case "${choice,,}" in
            1|commit)   run_commit_workflow ;;
            2|analyze)  analyze_repo ;;
            3|rewrite)  rewrite_history ;;
            4|validate) validate_recent ;;
            5|log)
                git log --oneline --graph --decorate -25 2>/dev/null | sed 's/^/  /'
                echo ""
                ;;
            q|quit|exit)
                success "Goodbye!"
                exit 0
                ;;
            *)
                warn "Unknown option '${choice}'"
                ;;
        esac
        echo ""
        read -rp "  Press Enter to continue..." _dummy
    done
}

main "$@"