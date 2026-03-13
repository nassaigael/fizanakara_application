#!/bin/bash

# ============================================================================
# ADVANCED GIT COMMIT MANAGER - AI-Powered Professional Commits
# Version 4.0 - Strict Conventional Commits + Gemini AI Intelligence
# ============================================================================
# Standards: Conventional Commits 1.0.0 | Semantic Versioning | Angular Style
# ============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
GEMINI_API_KEY="${GEMINI_API_KEY:-AIzaSyDTPSn7AQuTZ5lhDe80s8YFx_SYkoILJq4}"
GEMINI_MODEL="gemini-1.5-flash"
GEMINI_ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent"
CACHE_DIR=".git/.commit-manager"
LOG_FILE="${CACHE_DIR}/history.log"
CONFIG_FILE="${CACHE_DIR}/config.json"
MAX_SUBJECT_LENGTH=72
MAX_BODY_LINE_LENGTH=100
DIFF_CONTEXT_LINES=5
VERSION="4.0.0"

# ── ANSI Colors ───────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; PURPLE='\033[0;35m'; CYAN='\033[0;36m'
WHITE='\033[1;37m'; GRAY='\033[0;90m'; BOLD='\033[1m'
DIM='\033[2m'; UNDERLINE='\033[4m'; NC='\033[0m'

# ── Commit Types (Conventional Commits spec) ──────────────────────────────────
declare -A COMMIT_TYPES=(
    ["feat"]="✨ New feature"
    ["fix"]="🐛 Bug fix"
    ["docs"]="📚 Documentation"
    ["style"]="💄 Code style/formatting"
    ["refactor"]="♻️  Code refactor"
    ["perf"]="⚡ Performance improvement"
    ["test"]="🧪 Tests"
    ["build"]="🏗️  Build system/deps"
    ["ci"]="🔧 CI/CD configuration"
    ["chore"]="🔩 Chores/maintenance"
    ["revert"]="⏪ Revert changes"
    ["security"]="🔒 Security fix"
)

# ── Print Helpers ─────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}  →${NC} $1"; }
success() { echo -e "${GREEN}  ✔${NC} $1"; }
warn()    { echo -e "${YELLOW}  ⚠${NC} $1"; }
error()   { echo -e "${RED}  ✖${NC} $1" >&2; }
dim()     { echo -e "${GRAY}  $1${NC}"; }
bold()    { echo -e "${BOLD}$1${NC}"; }

header() {
    local title="$1"
    local width=62
    local line=$(printf '═%.0s' $(seq 1 $width))
    echo ""
    echo -e "${PURPLE}╔${line}╗${NC}"
    printf "${PURPLE}║${NC}  ${BOLD}%-${width}s${NC}${PURPLE}║${NC}\n" "$title  "
    echo -e "${PURPLE}╚${line}╝${NC}"
    echo ""
}

separator() { echo -e "${GRAY}$(printf '─%.0s' $(seq 1 64))${NC}"; }

# ── Dependency Check ──────────────────────────────────────────────────────────
check_dependencies() {
    local missing=()
    for cmd in git curl jq awk sed grep wc; do
        command -v "$cmd" &>/dev/null || missing+=("$cmd")
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing dependencies: ${missing[*]}"
        error "Install with: sudo apt-get install ${missing[*]}"
        exit 1
    fi

    # Validate git repo
    if ! git rev-parse --is-inside-work-tree &>/dev/null; then
        error "Not inside a git repository."
        exit 1
    fi

    # Initialize cache dir
    mkdir -p "$CACHE_DIR"
    touch "$LOG_FILE"
}

# ── Git Intelligence Layer ────────────────────────────────────────────────────

# Get rich diff with context, stats, and blame
get_rich_diff() {
    local file="$1"
    local change_type="$2"

    case "$change_type" in
        deleted)
            git show "HEAD:${file}" 2>/dev/null | head -200
            ;;
        new)
            git diff --cached --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null \
                || git diff --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null \
                || cat "$file" 2>/dev/null | head -200
            ;;
        *)
            git diff --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null \
                || git diff --cached --no-color -U"${DIFF_CONTEXT_LINES}" -- "$file" 2>/dev/null
            ;;
    esac
}

# Extract deep file metadata using git + static analysis
extract_file_intelligence() {
    local file="$1"
    local diff="$2"

    local ext="${file##*.}"
    local basename="${file##*/}"
    local name_no_ext="${basename%.*}"
    local dir="${file%/*}"
    [[ "$dir" == "$file" ]] && dir="root"

    # Detect language/framework
    local lang="unknown"
    case "$ext" in
        ts|tsx) lang="TypeScript" ;;
        js|jsx) lang="JavaScript" ;;
        py)     lang="Python" ;;
        go)     lang="Go" ;;
        rs)     lang="Rust" ;;
        java)   lang="Java" ;;
        rb)     lang="Ruby" ;;
        php)    lang="PHP" ;;
        cs)     lang="C#" ;;
        cpp|cc|cxx) lang="C++" ;;
        c)      lang="C" ;;
        md|mdx) lang="Markdown" ;;
        json)   lang="JSON" ;;
        yml|yaml) lang="YAML" ;;
        sql)    lang="SQL" ;;
        sh|bash) lang="Shell" ;;
        css|scss|sass) lang="CSS/SCSS" ;;
        html)   lang="HTML" ;;
        proto)  lang="Protobuf" ;;
        tf)     lang="Terraform" ;;
        dart)   lang="Dart" ;;
        swift)  lang="Swift" ;;
        kt)     lang="Kotlin" ;;
    esac

    # Detect framework/pattern from path
    local framework=""
    [[ "$file" =~ (component|Component|\.vue) ]] && framework="Component"
    [[ "$file" =~ (service|Service) ]] && framework="Service"
    [[ "$file" =~ (controller|Controller) ]] && framework="Controller"
    [[ "$file" =~ (hook|Hook|use[A-Z]) ]] && framework="Hook"
    [[ "$file" =~ (test|spec|__tests__) ]] && framework="Test"
    [[ "$file" =~ (middleware|Middleware) ]] && framework="Middleware"
    [[ "$file" =~ (model|Model|schema|Schema) ]] && framework="Model/Schema"
    [[ "$file" =~ (route|Route|router|Router) ]] && framework="Router"
    [[ "$file" =~ (util|Util|helper|Helper) ]] && framework="Utility"
    [[ "$file" =~ (store|Store|slice|Slice|reducer|Reducer) ]] && framework="State"
    [[ "$file" =~ (config|Config|\.env) ]] && framework="Config"
    [[ "$file" =~ (migration|Migration) ]] && framework="Migration"
    [[ "$file" =~ (docker|Docker|Dockerfile) ]] && framework="Docker"
    [[ "$file" =~ (github|gitlab|\.yml) ]] && framework="CI/CD"

    # Stats from diff
    local added removed
    added=$(echo "$diff" | grep -c '^+[^+]' 2>/dev/null || echo 0)
    removed=$(echo "$diff" | grep -c '^-[^-]' 2>/dev/null || echo 0)
    local net_change=$((added - removed))

    # Extract symbols changed
    local funcs changed_funcs changed_classes changed_interfaces changed_types
    changed_funcs=$(echo "$diff" | grep -E '^\+[^+].*(function |def |func |fn |async )' \
        | grep -oE '(function |def |func |fn |async )[a-zA-Z_][a-zA-Z0-9_]*' \
        | awk '{print $NF}' | sort -u | head -8 | tr '\n' ', ' | sed 's/,$//')
    changed_classes=$(echo "$diff" | grep -E '^\+[^+].*(class |interface |type )' \
        | grep -oE '(class |interface |type )[a-zA-Z_][a-zA-Z0-9_]*' \
        | awk '{print $NF}' | sort -u | head -5 | tr '\n' ', ' | sed 's/,$//')
    changed_exports=$(echo "$diff" | grep -c '^+[^+].*export ' 2>/dev/null || echo 0)
    changed_imports=$(echo "$diff" | grep -c '^+[^+].*import ' 2>/dev/null || echo 0)

    # Detect breaking change indicators
    local breaking_signals=""
    echo "$diff" | grep -qE '^\-.*export (default |const |function |class )' && \
        breaking_signals="removed-export"
    echo "$diff" | grep -qE '^\-.*\b(interface|type)\b.*\{' && \
        breaking_signals="${breaking_signals} changed-interface"

    # Git history context
    local last_commit_msg=""
    local commit_count=0
    if git log --oneline -- "$file" &>/dev/null; then
        last_commit_msg=$(git log -1 --pretty="%s" -- "$file" 2>/dev/null || echo "")
        commit_count=$(git log --oneline -- "$file" 2>/dev/null | wc -l | tr -d ' ')
    fi

    # Related files (files changed in same recent commits)
    local related_files=""
    related_files=$(git log -5 --name-only --pretty="" -- "$file" 2>/dev/null \
        | grep -v "^$" | grep -v "^$file$" | sort -u | head -5 | tr '\n' ', ' | sed 's/,$//')

    # Build JSON intelligence object
    jq -n \
        --arg file "$file" \
        --arg basename "$basename" \
        --arg name "$name_no_ext" \
        --arg dir "$dir" \
        --arg ext "$ext" \
        --arg lang "$lang" \
        --arg framework "$framework" \
        --argjson added "$added" \
        --argjson removed "$removed" \
        --argjson net "$net_change" \
        --arg funcs "$changed_funcs" \
        --arg classes "$changed_classes" \
        --argjson exports "$changed_exports" \
        --argjson imports "$changed_imports" \
        --arg breaking "$breaking_signals" \
        --arg last_msg "$last_commit_msg" \
        --argjson commit_count "$commit_count" \
        --arg related "$related_files" \
        '{
            file: $file, basename: $basename, name: $name,
            directory: $dir, extension: $ext, language: $lang,
            framework: $framework, stats: {
                added: $added, removed: $removed, net_change: $net
            },
            symbols: {
                functions: $funcs, classes: $classes,
                exports_changed: $exports, imports_changed: $imports
            },
            breaking_signals: $breaking,
            history: {
                last_message: $last_msg, commit_count: $commit_count,
                related_files: $related
            }
        }'
}

# Determine best scope from file path and project structure
determine_scope() {
    local file="$1"
    local intel="$2"

    # Try to detect monorepo structure
    local scope=""

    # Check package.json / workspace patterns
    local dir
    dir=$(echo "$file" | awk -F'/' '{print $1}')
    [[ -f "${dir}/package.json" ]] && {
        scope=$(jq -r '.name // empty' "${dir}/package.json" 2>/dev/null | sed 's/@[^/]*\///')
    }

    # Fallback to directory-based scope
    if [[ -z "$scope" ]]; then
        # Try second-level directory
        scope=$(echo "$file" | awk -F'/' 'NF>2 {print $2} NF<=2 {print $1}')
        # Clean up common prefixes
        scope=$(echo "$scope" | sed -E 's/^(src|lib|packages|apps|modules|core)$//')
        [[ -z "$scope" ]] && scope=$(echo "$file" | awk -F'/' '{print $1}')
    fi

    # Further cleanup
    scope=$(echo "$scope" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/^-//;s/-$//')
    [[ -z "$scope" ]] && scope="core"

    echo "$scope"
}

# ── Gemini AI Engine ──────────────────────────────────────────────────────────
call_gemini() {
    local prompt="$1"
    local temperature="${2:-0.3}"
    local max_tokens="${3:-1000}"

    local payload
    payload=$(jq -n \
        --arg text "$prompt" \
        --argjson temp "$temperature" \
        --argjson tokens "$max_tokens" \
        '{
            contents: [{parts: [{text: $text}]}],
            generationConfig: {
                temperature: $temp,
                maxOutputTokens: $tokens,
                topP: 0.85,
                topK: 40
            },
            safetySettings: [
                {category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE"},
                {category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE"}
            ]
        }')

    local response
    response=$(curl -sf -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}" 2>/dev/null) || {
        echo "GEMINI_ERROR"
        return 1
    }

    local result
    result=$(echo "$response" | jq -r '.candidates[0].content.parts[0].text // "GEMINI_ERROR"')
    echo "$result"
}

# Generate professional commit message via Gemini
generate_commit_message() {
    local intel_json="$1"
    local diff="$2"
    local change_type="$3"

    local file lang framework stats_added stats_removed scope
    file=$(echo "$intel_json" | jq -r '.file')
    lang=$(echo "$intel_json" | jq -r '.language')
    framework=$(echo "$intel_json" | jq -r '.framework')
    stats_added=$(echo "$intel_json" | jq -r '.stats.added')
    stats_removed=$(echo "$intel_json" | jq -r '.stats.removed')
    funcs=$(echo "$intel_json" | jq -r '.symbols.functions')
    classes=$(echo "$intel_json" | jq -r '.symbols.classes')
    breaking=$(echo "$intel_json" | jq -r '.breaking_signals')
    last_msg=$(echo "$intel_json" | jq -r '.history.last_message')
    related=$(echo "$intel_json" | jq -r '.history.related_files')

    scope=$(determine_scope "$file" "$intel_json")

    # Truncate diff to avoid token limits
    local diff_excerpt
    diff_excerpt=$(echo "$diff" | head -150 | sed 's/\\/\\\\/g; s/"/\\"/g; s/	/  /g')

    local prompt="You are a senior software engineer writing git commit messages that strictly follow the Conventional Commits 1.0.0 specification and Angular commit guidelines.

## FILE ANALYSIS
- File: ${file}
- Language: ${lang}
- Pattern: ${framework:-general}
- Change type: ${change_type}
- Lines added: ${stats_added}, removed: ${stats_removed}
- Functions modified: ${funcs:-none}
- Classes/Types modified: ${classes:-none}
- Breaking change signals: ${breaking:-none}
- Previous commit on this file: ${last_msg:-first commit}
- Related files changed together: ${related:-none}

## CODE DIFF
\`\`\`diff
${diff_excerpt}
\`\`\`

## COMMIT MESSAGE SPECIFICATION

### Format (STRICTLY ENFORCE):
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Rules:
1. **type** — must be one of: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security
2. **scope** — use \"${scope}\" unless a more specific scope is evident from the diff
3. **subject** — imperative mood, no capital first letter, no period at end, MAX 72 chars
4. **body** — wrap at 100 chars per line, explain the WHY not just WHAT, use bullet points starting with \"- \" for lists
5. **footer** — include ONLY if: breaking change (\"BREAKING CHANGE: ...\"), issue reference (\"Closes #N\"), co-author, or migration required

### Type selection logic:
- feat: new capability/functionality visible to users or other code
- fix: corrects incorrect behavior
- refactor: restructures code without changing behavior or adding features
- perf: measurably improves performance
- test: adds/modifies tests only
- build: dependency updates, build scripts, package.json changes
- ci: pipeline configuration, GitHub Actions, Docker
- docs: README, comments, JSDoc, API docs only
- style: formatting, whitespace, linting — zero logic change
- chore: maintenance tasks, code generation, tooling
- security: vulnerability fix, auth hardening, input validation
- revert: reverts a previous commit

### Body writing style:
- Explain what problem this solves or what need it addresses
- Describe the approach taken and why it was chosen over alternatives
- Mention side effects, dependencies updated, or migration steps if any
- Reference related systems or components affected
- Use technical precision — name specific methods, patterns, APIs changed
- 3-6 lines is ideal; be concise but complete

### BREAKING CHANGE rule:
If breaking_signals is not empty, add footer: \"BREAKING CHANGE: <explain impact and migration>\"

### Quality checklist:
- [ ] Subject is imperative mood (\"add\" not \"added\" or \"adds\")
- [ ] Subject under 72 characters
- [ ] Body explains WHY, not just WHAT
- [ ] No vague words like \"various\", \"some\", \"misc\", \"update stuff\"
- [ ] Scope accurately reflects the module/package affected

## OUTPUT
Return ONLY the raw commit message. No markdown fences, no explanations, no preamble.
The very first line must be the subject line starting with the type."

    local message
    message=$(call_gemini "$prompt" 0.25 900)

    if [[ "$message" == "GEMINI_ERROR" ]] || [[ -z "$message" ]]; then
        # Intelligent fallback without AI
        generate_fallback_message "$intel_json" "$change_type" "$scope"
        return
    fi

    # Sanitize: remove markdown fences
    message=$(echo "$message" | sed '/^```/d')

    # Validate subject line length
    local subject_line
    subject_line=$(echo "$message" | head -1)
    if [[ ${#subject_line} -gt $MAX_SUBJECT_LENGTH ]]; then
        warn "Subject line too long (${#subject_line} chars) — AI will trim"
        # Ask Gemini to shorten it
        local trim_prompt="Shorten this commit subject to under 72 characters, keeping conventional commit format. Return only the subject line:
${subject_line}"
        local short
        short=$(call_gemini "$trim_prompt" 0.1 80)
        [[ "$short" != "GEMINI_ERROR" ]] && message=$(echo "$message" | sed "1s/.*/${short}/")
    fi

    echo "$message"
}

# Fallback message generator (no AI)
generate_fallback_message() {
    local intel="$1"
    local change_type="$2"
    local scope="$3"

    local name lang framework added removed funcs
    name=$(echo "$intel" | jq -r '.name')
    lang=$(echo "$intel" | jq -r '.language')
    framework=$(echo "$intel" | jq -r '.framework')
    added=$(echo "$intel" | jq -r '.stats.added')
    removed=$(echo "$intel" | jq -r '.stats.removed')
    funcs=$(echo "$intel" | jq -r '.symbols.functions')
    ext=$(echo "$intel" | jq -r '.extension')

    # Determine type from context
    local type="chore"
    [[ "$ext" =~ ^(md|mdx|rst|txt)$ ]] && type="docs"
    [[ "$ext" =~ ^(json|yml|yaml|toml|ini)$ ]] && type="build"
    [[ "$ext" =~ ^(sh|bash)$ ]] && type="ci"
    [[ "$change_type" == "deleted" ]] && type="chore"
    [[ "$framework" == "Test" ]] && type="test"
    [[ "$framework" == "CI/CD" ]] && type="ci"
    [[ $added -gt 50 && $removed -lt 5 ]] && type="feat"
    [[ $removed -gt 20 && $added -lt $removed ]] && type="refactor"

    local subject="${type}(${scope}): "
    case "$type" in
        feat)    subject+="add ${name} ${framework:-module}" ;;
        fix)     subject+="correct behavior in ${name}" ;;
        refactor) subject+="restructure ${name} for clarity" ;;
        docs)    subject+="update documentation for ${name}" ;;
        test)    subject+="add tests for ${name}" ;;
        build)   subject+="update ${name} configuration" ;;
        ci)      subject+="update pipeline configuration" ;;
        *)       subject+="update ${name}" ;;
    esac

    local body="Automated change detected in ${lang} ${framework:-file}."
    [[ -n "$funcs" ]] && body+=" Modified functions: ${funcs}."
    body+="\n\nStats: +${added}/-${removed} lines."

    printf "%s\n\n%b" "$subject" "$body"
}

# ── Commit Validation ─────────────────────────────────────────────────────────
validate_commit_message() {
    local msg="$1"
    local errors=()
    local warnings=()

    local subject
    subject=$(echo "$msg" | head -1)

    # Check type
    if ! echo "$subject" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\(.+\))?(!)?:'; then
        errors+=("Subject must start with a valid type: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security")
    fi

    # Check subject length
    [[ ${#subject} -gt $MAX_SUBJECT_LENGTH ]] && \
        errors+=("Subject too long: ${#subject} chars (max ${MAX_SUBJECT_LENGTH})")
    [[ ${#subject} -lt 10 ]] && \
        errors+=("Subject too short: ${#subject} chars (min 10)")

    # Check imperative mood (basic heuristics)
    local desc
    desc=$(echo "$subject" | sed -E 's/^[a-z]+(\([^)]+\))?!?: //')
    echo "$desc" | grep -qiE '^(added|fixed|updated|changed|removed|deleted|created|modified)' && \
        warnings+=("Subject appears to use past tense — use imperative: 'add' not 'added'")

    # Check blank line between subject and body
    local line2
    line2=$(echo "$msg" | sed -n '2p')
    [[ -n "$line2" ]] && \
        errors+=("Missing blank line between subject and body")

    # Check body line length
    while IFS= read -r line; do
        [[ ${#line} -gt $MAX_BODY_LINE_LENGTH ]] && \
            warnings+=("Body line exceeds ${MAX_BODY_LINE_LENGTH} chars: '${line:0:60}...'")
    done < <(echo "$msg" | tail -n +3)

    # Check for vague words
    echo "$subject" | grep -qiE '\b(misc|various|stuff|things|changes|update|updates|fixes|fix|some)\b' && \
        warnings+=("Subject contains vague language — be specific")

    # Print results
    local valid=true
    for e in "${errors[@]}"; do
        error "INVALID: $e"
        valid=false
    done
    for w in "${warnings[@]}"; do
        warn "WARNING: $w"
    done

    $valid
}

# ── Interactive Commit Flow ───────────────────────────────────────────────────
display_commit_preview() {
    local msg="$1"
    local intel="$2"

    local file lang stats_added stats_removed
    file=$(echo "$intel" | jq -r '.file')
    lang=$(echo "$intel" | jq -r '.language')
    stats_added=$(echo "$intel" | jq -r '.stats.added')
    stats_removed=$(echo "$intel" | jq -r '.stats.removed')

    separator
    echo -e "${BOLD}  📋 COMMIT PREVIEW${NC}"
    separator
    echo ""

    # Color-coded message
    local line_num=0
    while IFS= read -r line; do
        line_num=$((line_num + 1))
        case $line_num in
            1)  echo -e "  ${CYAN}${BOLD}${line}${NC}" ;;  # Subject
            2)  echo "" ;;                                  # Blank line
            *)  echo -e "  ${WHITE}${line}${NC}" ;;         # Body/footer
        esac
    done <<< "$msg"

    echo ""
    separator
    echo -e "  ${GRAY}${lang} · +${stats_added}/-${stats_removed} lines · ${file}${NC}"
    separator
}

# Process a single file with full interactive flow
process_file() {
    local file="$1"
    local change_type="$2"
    local index="$3"
    local total="$4"
    local commit_timestamp="$5"

    header "[${index}/${total}] ${file}"

    # Get diff
    info "Analyzing changes..."
    local diff
    diff=$(get_rich_diff "$file" "$change_type")

    if [[ -z "$diff" ]] && [[ "$change_type" != "deleted" ]]; then
        warn "No diff found for $file — skipping"
        return 0
    fi

    # Extract intelligence
    info "Extracting code intelligence..."
    local intel
    intel=$(extract_file_intelligence "$file" "$diff")

    local lang framework
    lang=$(echo "$intel" | jq -r '.language')
    framework=$(echo "$intel" | jq -r '.framework')
    added=$(echo "$intel" | jq -r '.stats.added')
    removed=$(echo "$intel" | jq -r '.stats.removed')

    echo -e "  ${CYAN}Language:${NC} ${lang} ${framework:+(${framework})}"
    echo -e "  ${CYAN}Changes:${NC} ${GREEN}+${added}${NC} / ${RED}-${removed}${NC} lines"
    echo ""

    # Generate message
    info "Generating professional commit message via Gemini AI..."
    local commit_msg
    commit_msg=$(generate_commit_message "$intel" "$diff" "$change_type")

    # Validation loop
    local attempts=0
    while true; do
        attempts=$((attempts + 1))

        display_commit_preview "$commit_msg" "$intel"

        # Validate
        echo ""
        if ! validate_commit_message "$commit_msg" 2>/dev/null; then
            warn "Commit message has issues. Review before proceeding."
        else
            success "Commit message is valid ✓"
        fi

        echo ""
        echo -e "  ${BOLD}Actions:${NC}"
        echo -e "  ${GREEN}[c]${NC} Commit with this message"
        echo -e "  ${YELLOW}[e]${NC} Edit message in \$EDITOR"
        echo -e "  ${BLUE}[r]${NC} Regenerate with AI"
        echo -e "  ${PURPLE}[v]${NC} Validate only (re-check)"
        echo -e "  ${CYAN}[d]${NC} Show full diff"
        echo -e "  ${CYAN}[i]${NC} Show file intelligence"
        echo -e "  ${GRAY}[s]${NC} Skip this file"
        echo -e "  ${RED}[q]${NC} Quit"
        echo ""
        read -rp "  → " choice
        echo ""

        case "${choice,,}" in
            c)
                break
                ;;
            e)
                local tmpfile
                tmpfile=$(mktemp /tmp/commit-msg-XXXX.txt)
                echo "$commit_msg" > "$tmpfile"
                # Append commit guidelines as comments
                cat >> "$tmpfile" << 'EOF'

# ─── Commit Message Guidelines ────────────────────────────────────────────────
# Format: <type>(<scope>): <subject>
# Types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security
# Subject: imperative mood, max 72 chars, no period at end
# Body: explain WHY, wrap at 100 chars, blank line after subject
# Footer: BREAKING CHANGE: ... | Closes #N
# ──────────────────────────────────────────────────────────────────────────────
EOF
                ${EDITOR:-nano} "$tmpfile"
                commit_msg=$(grep -v '^#' "$tmpfile" | sed '/^$/d;$s/$/\n/' | head -50)
                rm -f "$tmpfile"
                ;;
            r)
                info "Regenerating with AI (attempt $((attempts + 1)))..."
                commit_msg=$(generate_commit_message "$intel" "$diff" "$change_type")
                ;;
            v)
                validate_commit_message "$commit_msg"
                read -rp "  Press Enter to continue..."
                ;;
            d)
                echo ""
                echo -e "${CYAN}  Full diff for ${file}:${NC}"
                separator
                echo "$diff" | head -200 | while IFS= read -r line; do
                    case "${line:0:1}" in
                        +) echo -e "${GREEN}${line}${NC}" ;;
                        -) echo -e "${RED}${line}${NC}" ;;
                        @) echo -e "${CYAN}${line}${NC}" ;;
                        *) echo -e "${GRAY}${line}${NC}" ;;
                    esac
                done
                [[ $(echo "$diff" | wc -l) -gt 200 ]] && \
                    dim "... (truncated, $(echo "$diff" | wc -l) total lines)"
                echo ""
                read -rp "  Press Enter to continue..."
                ;;
            i)
                echo ""
                echo -e "${CYAN}  File Intelligence:${NC}"
                echo "$intel" | jq '.'
                echo ""
                read -rp "  Press Enter to continue..."
                ;;
            s)
                warn "Skipped: $file"
                return 0
                ;;
            q)
                echo ""
                warn "Quit by user."
                exit 0
                ;;
            *)
                warn "Unknown option. Use c/e/r/v/d/i/s/q"
                ;;
        esac
    done

    # Stage file
    if [[ "$change_type" == "deleted" ]]; then
        git rm --cached "$file" &>/dev/null || git rm "$file" &>/dev/null || true
    else
        git add "$file" &>/dev/null
    fi

    # Commit with optional backdated timestamp
    local commit_date
    commit_date=$(date -d "@${commit_timestamp}" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null \
        || date -r "$commit_timestamp" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null \
        || date +"%Y-%m-%dT%H:%M:%S")

    export GIT_AUTHOR_DATE="$commit_date"
    export GIT_COMMITTER_DATE="$commit_date"

    if echo "$commit_msg" | git commit --no-verify -F - &>/dev/null; then
        local short_hash
        short_hash=$(git rev-parse --short HEAD)
        success "Committed: ${short_hash} — $(echo "$commit_msg" | head -1)"
        echo "$(date -Iseconds) | ${short_hash} | $(echo "$commit_msg" | head -1)" >> "$LOG_FILE"
    else
        error "Git commit failed for $file"
        warn "Staging area:"
        git status --short
        return 1
    fi
}

# ── Repository Analysis ───────────────────────────────────────────────────────
analyze_repo() {
    header "REPOSITORY ANALYSIS"

    local branch
    branch=$(git rev-parse --abbrev-ref HEAD)
    local remote
    remote=$(git remote get-url origin 2>/dev/null || echo "no remote")
    local total_commits
    total_commits=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    local contributors
    contributors=$(git shortlog -sn --no-merges 2>/dev/null | wc -l | tr -d ' ')

    echo -e "  ${BOLD}Repository Info:${NC}"
    echo -e "  Branch:      ${CYAN}${branch}${NC}"
    echo -e "  Remote:      ${GRAY}${remote}${NC}"
    echo -e "  Commits:     ${total_commits}"
    echo -e "  Contributors:${contributors}"
    echo ""

    echo -e "  ${BOLD}Working Tree Status:${NC}"
    git status --short | head -30 | while IFS= read -r line; do
        local status="${line:0:2}"
        local file="${line:3}"
        case "${status:0:1}" in
            M|m) echo -e "  ${YELLOW}modified${NC}   $file" ;;
            A)   echo -e "  ${GREEN}added${NC}      $file" ;;
            D)   echo -e "  ${RED}deleted${NC}    $file" ;;
            R)   echo -e "  ${PURPLE}renamed${NC}    $file" ;;
            \?)  echo -e "  ${GRAY}untracked${NC}  $file" ;;
            *)   echo -e "  ${GRAY}${status}${NC}         $file" ;;
        esac
    done
    echo ""

    echo -e "  ${BOLD}Recent Commit History:${NC}"
    git log --oneline --graph --decorate -10 2>/dev/null | \
        sed 's/^/  /'
    echo ""

    # Check commit message quality of recent commits
    echo -e "  ${BOLD}Commit Quality Analysis (last 10):${NC}"
    local good=0 bad=0
    while IFS= read -r line; do
        if echo "$line" | grep -qE '^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\(.+\))?(!)?:'; then
            good=$((good + 1))
            echo -e "  ${GREEN}✔${NC} $line"
        else
            bad=$((bad + 1))
            echo -e "  ${RED}✖${NC} $line"
        fi
    done < <(git log --oneline -10 2>/dev/null)
    echo ""
    echo -e "  Conventional: ${GREEN}${good}${NC} / Non-conventional: ${RED}${bad}${NC}"
    separator
}

# ── Bulk Commit Mode ──────────────────────────────────────────────────────────
get_changed_files() {
    # Returns: "STATUS FILE" pairs
    {
        # Staged changes
        git diff --cached --name-status 2>/dev/null | while IFS=$'\t' read -r status file _rest; do
            echo "$status $file"
        done
        # Unstaged changes
        git diff --name-status 2>/dev/null | while IFS=$'\t' read -r status file _rest; do
            echo "$status $file"
        done
        # Untracked
        git ls-files --others --exclude-standard 2>/dev/null | while IFS= read -r file; do
            echo "? $file"
        done
    } | sort -u -k2
}

map_status_to_type() {
    local status="$1"
    case "${status:0:1}" in
        A|\?) echo "new" ;;
        D)    echo "deleted" ;;
        R)    echo "renamed" ;;
        *)    echo "modified" ;;
    esac
}

# ── Main Commit Workflow ──────────────────────────────────────────────────────
run_commit_workflow() {
    header "COMMIT WORKFLOW — AI-Powered Professional Commits"

    # Parse changed files
    local -a files=()
    local -a types=()

    while IFS=' ' read -r status file; do
        [[ -z "$file" ]] && continue
        files+=("$file")
        types+=("$(map_status_to_type "$status")")
    done < <(get_changed_files)

    local total=${#files[@]}

    if [[ $total -eq 0 ]]; then
        success "Nothing to commit — working tree is clean."
        return 0
    fi

    echo -e "  ${BOLD}Changes detected:${NC}"
    for i in "${!files[@]}"; do
        local type_label="${types[$i]}"
        case "$type_label" in
            new)     echo -e "  ${GREEN}+${NC} ${files[$i]}" ;;
            deleted) echo -e "  ${RED}−${NC} ${files[$i]}" ;;
            renamed) echo -e "  ${PURPLE}→${NC} ${files[$i]}" ;;
            *)       echo -e "  ${YELLOW}~${NC} ${files[$i]}" ;;
        esac
    done
    echo ""

    # Backdate option
    local use_backdate=false
    local start_timestamp end_timestamp interval=0
    echo -e "  ${BOLD}Commit Timestamps:${NC}"
    echo -e "  [1] Use current time (default)"
    echo -e "  [2] Backdate commits over a date range"
    echo ""
    read -rp "  → " ts_choice

    if [[ "${ts_choice}" == "2" ]]; then
        use_backdate=true
        read -rp "  Start date (YYYY-MM-DD HH:MM:SS): " start_str
        start_timestamp=$(date -d "$start_str" +%s 2>/dev/null) || {
            error "Invalid date format"; return 1
        }
        end_timestamp=$(date +%s)
        [[ $total -gt 1 ]] && interval=$(( (end_timestamp - start_timestamp) / total )) || interval=3600
        [[ $interval -lt 300 ]] && interval=300
        info "Spacing ${total} commits ~$((interval / 60))min apart from ${start_str}"
    else
        start_timestamp=$(date +%s)
        interval=0
    fi

    echo ""
    read -rp "  Proceed with ${total} file(s)? [Y/n]: " confirm
    [[ "${confirm,,}" == "n" ]] && return 0

    # Process each file
    local current_timestamp=$start_timestamp
    local success_count=0

    for i in "${!files[@]}"; do
        process_file "${files[$i]}" "${types[$i]}" "$((i + 1))" "$total" "$current_timestamp" && \
            success_count=$((success_count + 1))
        current_timestamp=$((current_timestamp + interval))
    done

    unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE

    echo ""
    header "COMPLETE"
    success "${success_count}/${total} commits created successfully"

    echo -e "  ${BOLD}Recent commits:${NC}"
    git log --oneline --graph -${total} 2>/dev/null | sed 's/^/  /'
    echo ""
}

# ── Amend / Rewrite History Mode ─────────────────────────────────────────────
amend_commits() {
    header "REWRITE COMMIT MESSAGES"
    warn "This rewrites git history. Only use on unpushed commits or with team consent."
    echo ""

    local n
    read -rp "  How many recent commits to rewrite? [1-20]: " n
    [[ ! "$n" =~ ^[0-9]+$ ]] || [[ $n -lt 1 ]] || [[ $n -gt 20 ]] && {
        error "Invalid number"; return 1
    }

    echo ""
    echo -e "  ${BOLD}Commits to rewrite:${NC}"
    git log --oneline -${n} | sed 's/^/  /'
    echo ""
    read -rp "  Continue? [y/N]: " confirm
    [[ "${confirm,,}" != "y" ]] && return 0

    # Create backup branch
    local backup="backup/rewrite-$(date +%Y%m%d%H%M%S)"
    git branch "$backup" HEAD
    success "Backup branch created: ${backup}"

    # Rewrite each commit interactively
    local hashes=()
    while IFS= read -r line; do
        hashes+=("$(echo "$line" | awk '{print $1}')")
    done < <(git log --oneline -${n} | tac)

    for hash in "${hashes[@]}"; do
        local old_msg subject
        old_msg=$(git log -1 --pretty="%B" "$hash")
        subject=$(git log -1 --pretty="%s" "$hash")

        echo ""
        echo -e "  ${YELLOW}Commit: ${hash}${NC}"
        echo -e "  Old: ${GRAY}${subject}${NC}"

        # Get diff for this commit
        local diff
        diff=$(git show --no-color -U5 "$hash" | tail -n +5 | head -150)
        local files_changed
        files_changed=$(git diff-tree --no-commit-id -r --name-only "$hash" | head -1)

        # Generate new message
        if [[ -n "$files_changed" ]]; then
            local intel
            intel=$(extract_file_intelligence "$files_changed" "$diff")
            local new_msg
            new_msg=$(generate_commit_message "$intel" "$diff" "modified")
            echo -e "  New: ${GREEN}$(echo "$new_msg" | head -1)${NC}"

            read -rp "  Apply? [Y/n/e(dit)]: " apply
            case "${apply,,}" in
                n) continue ;;
                e)
                    local tmpfile
                    tmpfile=$(mktemp)
                    echo "$new_msg" > "$tmpfile"
                    ${EDITOR:-nano} "$tmpfile"
                    new_msg=$(cat "$tmpfile")
                    rm -f "$tmpfile"
                    ;;
            esac

            # Use git filter-branch or git replace (safer approach)
            git filter-branch -f --msg-filter \
                "if [ \"\$GIT_COMMIT\" = \"${hash}\" ]; then echo $(echo "$new_msg" | jq -Rs .); else cat; fi" \
                "${hash}^..HEAD" &>/dev/null && \
                success "Rewrote: ${hash}" || warn "Could not rewrite: ${hash}"
        fi
    done
}

# ── Main Menu ─────────────────────────────────────────────────────────────────
show_main_menu() {
    clear
    echo -e "${PURPLE}"
    cat << 'EOF'
  ╔══════════════════════════════════════════════════════════════╗
  ║         ADVANCED GIT COMMIT MANAGER v4.0                     ║
  ║         AI-Powered · Conventional Commits · Strict           ║
  ╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    local branch
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local status_count
    status_count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

    echo -e "  ${GRAY}Branch: ${CYAN}${branch}${NC}  ${GRAY}Pending changes: ${YELLOW}${status_count}${NC}"
    echo ""
    echo -e "  ${BOLD}[1]${NC} Create commits (AI-powered, file by file)"
    echo -e "  ${BOLD}[2]${NC} Analyze repository"
    echo -e "  ${BOLD}[3]${NC} Rewrite recent commit messages"
    echo -e "  ${BOLD}[4]${NC} View commit log"
    echo -e "  ${BOLD}[5]${NC} Validate all recent commits"
    echo -e "  ${BOLD}[q]${NC} Quit"
    echo ""
}

validate_all_recent() {
    header "VALIDATE RECENT COMMITS"
    local n=10
    read -rp "  Check last N commits [${n}]: " input_n
    [[ "$input_n" =~ ^[0-9]+$ ]] && n=$input_n

    local good=0 bad=0
    git log --format="%H %s" -${n} | while IFS=' ' read -r hash subject; do
        if echo "${hash} ${subject}" | grep -qE '[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\(.+\))?(!)?: .{5,}'; then
            echo -e "  ${GREEN}✔${NC} ${GRAY}${hash:0:7}${NC} ${subject}"
        else
            echo -e "  ${RED}✖${NC} ${GRAY}${hash:0:7}${NC} ${subject}"
        fi
    done
}

# ── Entry Point ───────────────────────────────────────────────────────────────
main() {
    check_dependencies

    # Direct mode via argument
    case "${1:-}" in
        commit|c) run_commit_workflow; exit 0 ;;
        analyze|a) analyze_repo; exit 0 ;;
        validate|v) validate_all_recent; exit 0 ;;
        --version) echo "git-commit-manager v${VERSION}"; exit 0 ;;
        --help|-h)
            echo "Usage: $0 [commit|analyze|validate|--version]"
            echo "  No args: interactive menu"
            exit 0
            ;;
    esac

    # Interactive mode
    while true; do
        show_main_menu
        read -rp "  → " choice
        echo ""
        case "${choice,,}" in
            1|commit)   run_commit_workflow ;;
            2|analyze)  analyze_repo ;;
            3|rewrite)  amend_commits ;;
            4|log)      git log --oneline --graph --decorate -20; echo "" ;;
            5|validate) validate_all_recent ;;
            q|quit|exit) success "Goodbye!"; exit 0 ;;
            *) warn "Unknown option: '${choice}'" ;;
        esac
        echo ""
        read -rp "  Press Enter to continue..."
    done
}

main "$@"