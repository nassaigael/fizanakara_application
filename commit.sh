#!/bin/bash

# Script combiné de commit intelligent avec analyse Git et backdating
# Respecte les normes Conventional Commits sans émojis

# Configuration
GEMINI_API_KEY="AIzaSyDTPSn7AQuTZ5lhDe80s8YFx_SYkoILJq4"
CACHE_FILE=".gemini_commits_cache.json"
BACKUP_BRANCH_PREFIX="backup-$(date +%Y%m%d%H%M%S)"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_header() { echo -e "${PURPLE}🚀 $1${NC}"; }
print_code() { echo -e "${CYAN}$1${NC}"; }

# Vérification des dépendances
check_dependencies() {
    print_info "Vérification des dépendances..."
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq n'est pas installé. Installation en cours..."
        sudo apt-get update && sudo apt-get install -y jq
    fi
    
    if ! command -v curl &> /dev/null; then
        print_warning "curl n'est pas installé. Installation en cours..."
        sudo apt-get update && sudo apt-get install -y curl
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git n'est pas installé!"
        exit 1
    fi
}

# Fonction pour analyser le type de changement basé sur le diff
analyze_change_type() {
    local file=$1
    local diff_content=$2
    local file_content=$3
    
    # Analyser le contenu du diff pour déterminer le type
    if echo "$diff_content" | grep -q "^+.*function\|^+.*class\|^+.*interface\|^+.*const\|^+.*let\|^+.*var"; then
        echo "feat"
    elif echo "$diff_content" | grep -q "^+.*console.log\|^+.*debugger\|^+.*TODO\|^+.*FIXME"; then
        echo "chore"
    elif echo "$diff_content" | grep -q "^+.*test(" || [[ "$file" == *".test."* ]] || [[ "$file" == *".spec."* ]]; then
        echo "test"
    elif [[ "$file" == *".md" ]] || [[ "$file" == *"README"* ]] || [[ "$file" == *"DOCS"* ]]; then
        echo "docs"
    elif [[ "$file" == *".json" ]] || [[ "$file" == *".yml" ]] || [[ "$file" == *"config"* ]]; then
        echo "chore"
    elif echo "$diff_content" | grep -q "^+.*border\|^+.*color\|^+.*margin\|^+.*padding\|^+.*font\|^+.*display\|^+.*flex\|^+.*grid"; then
        echo "style"
    elif echo "$diff_content" | grep -q "^+.*if.*error\|^+.*try\|^+.*catch\|^+.*throw\|^+.*return null\|^+.*undefined"; then
        echo "fix"
    elif echo "$diff_content" | grep -q "^+.*refactor\|^+.*rename\|^+.*extract\|^+.*inline\|^+.*move"; then
        echo "refactor"
    elif echo "$diff_content" | grep -q "^+.*perf\|^+.*optimize\|^+.*improve performance\|^+.*memoize\|^+.*cache"; then
        echo "perf"
    else
        # Par défaut, compter les lignes modifiées
        local additions=$(echo "$diff_content" | grep -c "^+" || true)
        local deletions=$(echo "$diff_content" | grep -c "^-" || true)
        
        if [ $additions -gt 10 ] && [ $deletions -lt 5 ]; then
            echo "feat"
        elif [ $deletions -gt 5 ] && [ $additions -lt 5 ]; then
            echo "fix"
        else
            echo "refactor"
        fi
    fi
}

# Fonction pour déterminer le scope basé sur le fichier
determine_scope() {
    local file=$1
    
    # Extraire le nom du composant/dossier principal
    if [[ "$file" == src/* ]]; then
        echo "$file" | cut -d'/' -f2 | cut -d'.' -f1
    elif [[ "$file" == components/* ]]; then
        echo "$file" | cut -d'/' -f2 | cut -d'.' -f1
    elif [[ "$file" == pages/* ]]; then
        echo "$file" | cut -d'/' -f2 | cut -d'.' -f1
    elif [[ "$file" == api/* ]]; then
        echo "$file" | cut -d'/' -f2 | cut -d'.' -f1
    elif [[ "$file" == utils/* ]]; then
        echo "utils"
    elif [[ "$file" == hooks/* ]]; then
        echo "hooks"
    elif [[ "$file" == styles/* ]]; then
        echo "styles"
    elif [[ "$file" == types/* ]]; then
        echo "types"
    else
        echo "$(basename "$file" | cut -d'.' -f1)"
    fi
}

# Fonction pour générer une description courte (max 50 chars)
generate_short_description() {
    local type=$1
    local scope=$2
    local file=$3
    local diff_content=$4
    
    # Extraire la première fonction/classe modifiée
    local first_function=$(echo "$diff_content" | grep -m1 "^+.*function [a-zA-Z0-9_]*" | sed 's/^+.*function \([a-zA-Z0-9_]*\).*/\1/' || echo "")
    
    if [ -n "$first_function" ]; then
        echo "update $first_function functionality"
    else
        local base_name=$(basename "$file" | cut -d'.' -f1)
        case $type in
            feat) echo "add new $base_name feature" ;;
            fix) echo "fix $base_name behavior" ;;
            refactor) echo "restructure $base_name implementation" ;;
            style) echo "adjust $base_name appearance" ;;
            docs) echo "update $base_name documentation" ;;
            test) echo "add $base_name test coverage" ;;
            perf) echo "optimize $base_name performance" ;;
            chore) echo "update $base_name configuration" ;;
            *) echo "modify $base_name" ;;
        esac
    fi
}

# Fonction pour générer le corps du message (pourquoi, pas comment)
generate_body() {
    local type=$1
    local file=$2
    local diff_content=$3
    local change_type=$4
    
    local body=""
    
    case $type in
        feat)
            body="Implement new functionality to improve user experience"
            ;;
        fix)
            local error_patterns=$(echo "$diff_content" | grep -E "^+.*if.*null|^+.*if.*undefined|^+.*try|^+.*catch" | head -3)
            if [ -n "$error_patterns" ]; then
                body="Handle edge cases to prevent runtime errors"
            else
                body="Correct unexpected behavior identified during testing"
            fi
            ;;
        refactor)
            body="Improve code maintainability without changing functionality"
            ;;
        style)
            body="Enhance visual consistency and user interface design"
            ;;
        perf)
            body="Reduce execution time and improve resource utilization"
            ;;
        test)
            body="Ensure code reliability through comprehensive testing"
            ;;
        docs)
            body="Clarify usage and maintain accurate project documentation"
            ;;
        chore)
            body="Keep development environment and dependencies up to date"
            ;;
    esac
    
    echo "$body"
}

# Fonction pour analyser un fichier avec Gemini (fallback amélioré)
analyze_file_with_gemini() {
    local file_path=$1
    local change_type=$2
    local diff_content=""
    local file_content=""
    
    print_info "Analyse de $file_path par Gemini..."
    
    # Récupérer le contenu selon le type
    if [ "$change_type" = "deleted" ]; then
        file_content=$(git show HEAD:"$file_path" 2>/dev/null || echo "Fichier supprimé")
        diff_content=$(git diff --staged "$file_path" 2>/dev/null || echo "Fichier supprimé")
    elif [ "$change_type" = "modified" ]; then
        file_content=$(cat "$file_path" 2>/dev/null | head -n 200 || echo "Impossible de lire")
        diff_content=$(git diff "$file_path" || echo "Diff non disponible")
    else
        file_content=$(cat "$file_path" 2>/dev/null | head -n 200 || echo "Nouveau fichier")
        diff_content="Nouveau fichier"
    fi
    
    # Analyse locale du type et scope
    local local_type=$(analyze_change_type "$file_path" "$diff_content" "$file_content")
    local scope=$(determine_scope "$file_path")
    local short_desc=$(generate_short_description "$local_type" "$scope" "$file_path" "$diff_content")
    local body=$(generate_body "$local_type" "$file_path" "$diff_content" "$change_type")
    
    # Prompt structuré pour Gemini
    local prompt="Génère un message de commit professionnel en français.

CONTEXTE:
- Fichier: $file_path
- Type de changement: $change_type
- Type estimé: $local_type
- Scope estimé: $scope

DIFF DU CHANGEMENT:
\`\`\`diff
${diff_content:0:2000}
\`\`\`

CONTENU DU FICHIER:
\`\`\`
${file_content:0:1000}
\`\`\`

RÈGLES STRICTES À SUIVRE:

1. FORMAT OBLIGATOIRE:
   <type>(<scope>): <description>
   
   [corps du message]

   [footer optionnel]

2. TYPE (choisir le plus pertinent):
   - feat: nouvelle fonctionnalité
   - fix: correction de bug
   - refactor: remaniement du code
   - style: changements de style (CSS, formatage)
   - docs: documentation
   - test: ajout ou modification de tests
   - perf: amélioration de performance
   - chore: tâches de maintenance

3. DESCRIPTION:
   - Maximum 50 caractères
   - Impératif présent
   - Sans point final
   - Expliquer CE qui est fait, pas comment

4. CORPS:
   - Expliquer POURQUOI le changement est fait
   - Maximum 72 caractères par ligne
   - Plusieurs lignes si nécessaire
   - Commencer par expliquer le contexte/problème

5. FOOTER (optionnel):
   - Références Jira/Tickets: PROJ-123
   - Breaking changes: BREAKING CHANGE: description

EXEMPLE ATTENDU:
feat(auth): add login form validation

Implement client-side validation to prevent unnecessary API calls
and improve user experience with immediate feedback.

Reference Jira: AUTH-456

GÉNÈRE UNIQUEMENT LE MESSAGE DE COMMIT SANS EXPLICATIONS:"

    # Appel à l'API Gemini
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"contents\": [{
                \"parts\": [{
                    \"text\": $(echo "$prompt" | jq -Rs .)
                }]
            }],
            \"generationConfig\": {
                \"temperature\": 0.3,
                \"maxOutputTokens\": 250,
                \"topP\": 0.8
            }
        }" \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY")
    
    # Extraire et nettoyer la réponse
    local gemini_text=$(echo "$response" | jq -r '.candidates[0].content.parts[0].text // ""')
    
    # Nettoyer le message
    gemini_text=$(echo "$gemini_text" | sed 's/^```//g' | sed 's/```$//g' | sed 's/^`//g' | sed 's/`$//g' | tr -d '\r')
    
    # Si la réponse est vide, utiliser notre analyse locale
    if [ -z "$gemini_text" ] || [ "$gemini_text" = "null" ]; then
        gemini_text="$local_type($scope): $short_desc\n\n$body"
        if [[ "$file_path" == *"jira"* ]] || [[ "$file_path" == *"ticket"* ]]; then
            gemini_text="$gemini_text\n\nReference: PROJ-123"
        fi
    fi
    
    echo -e "$gemini_text"
}

# Fonction pour obtenir une analyse avec cache
get_cached_analysis() {
    local file=$1
    local change_type=$2
    local file_hash=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1 || echo "deleted")
    local cache_key="${file}:${change_type}:${file_hash}"
    
    if [ -f "$CACHE_FILE" ]; then
        local cached=$(jq -r --arg key "$cache_key" '.[$key] // empty' "$CACHE_FILE" 2>/dev/null)
        if [ -n "$cached" ] && [ "$cached" != "null" ]; then
            print_info "Utilisation du cache pour $file"
            echo -e "$cached"
            return 0
        fi
    fi
    
    local analysis=$(analyze_file_with_gemini "$file" "$change_type")
    
    if [ -n "$analysis" ]; then
        local temp_file=$(mktemp)
        local escaped_analysis=$(echo "$analysis" | jq -Rs .)
        
        if [ -f "$CACHE_FILE" ]; then
            jq --arg key "$cache_key" --argjson val "$escaped_analysis" '. + {($key): $val}' "$CACHE_FILE" > "$temp_file" 2>/dev/null
        else
            echo "{\"$cache_key\": $escaped_analysis}" > "$temp_file"
        fi
        
        if [ -s "$temp_file" ]; then
            mv "$temp_file" "$CACHE_FILE"
        fi
    fi
    
    echo -e "$analysis"
}

# Fonction pour afficher un aperçu du message
preview_message() {
    local message=$1
    echo -e "${CYAN}┌────────────────────────────────────────${NC}"
    echo -e "${CYAN}│ Aperçu du message:${NC}"
    echo "$message" | while IFS= read -r line; do
        echo -e "${CYAN}│${NC} $line"
    done
    echo -e "${CYAN}└────────────────────────────────────────${NC}"
}

# Fonction principale pour les nouveaux commits
create_new_commits() {
    print_header "Création de nouveaux commits avec backdating"
    
    # Date de début
    local start_date=${1:-"2025-12-01 09:00:00"}
    print_info "Date de début: $start_date"
    
    # Convertir en timestamp - NE PAS MODIFIER LE FORMAT DE LA DATE
    local start_timestamp=$(date -d "$start_date" +%s 2>/dev/null)
    if [ -z "$start_timestamp" ]; then
        print_error "Format de date invalide. Utilisez: YYYY-MM-DD HH:MM:SS"
        return 1
    fi
    
    local current_timestamp=$(date +%s)
    
    # Compter les fichiers - Utiliser des tableaux pour stocker les fichiers
    local deleted_files=()
    local modified_files=()
    local added_files=()
    
    # Lire le status git et remplir les tableaux
    while IFS= read -r line; do
        local status="${line:0:2}"
        local file="${line:3}"
        
        if [[ $status == *"D"* ]] || [[ $status == "D " ]]; then
            deleted_files+=("$file")
        elif [[ $status == *"M"* ]] || [[ $status == "M " ]]; then
            modified_files+=("$file")
        elif [[ $status == "??" ]]; then
            added_files+=("$file")
        fi
    done < <(git status --porcelain)
    
    local total_changes=$(( ${#deleted_files[@]} + ${#modified_files[@]} + ${#added_files[@]} ))
    
    print_info "Changements détectés:"
    echo "   - Modifiés: ${#modified_files[@]}"
    echo "   - Supprimés: ${#deleted_files[@]}"
    echo "   - Nouveaux: ${#added_files[@]}"
    echo "   - Total: $total_changes"
    
    if [ $total_changes -eq 0 ]; then
        print_success "Aucun changement!"
        return 0
    fi
    
    # Calculer l'intervalle
    local total_seconds=$((current_timestamp - start_timestamp))
    local interval=$((total_seconds / total_changes))
    [ $interval -lt 60 ] && interval=60
    
    print_info "Création de $total_changes commits de $start_date à maintenant"
    print_info "Intervalle: ~$interval secondes"
    
    # Confirmation
    echo ""
    read -p "Voulez-vous continuer? (o/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        return 0
    fi
    
    # Initialiser
    local commit_timestamp=$start_timestamp
    local commit_count=0
    
    # Traiter les fichiers supprimés
    if [ ${#deleted_files[@]} -gt 0 ]; then
        echo ""
        print_info "Traitement des fichiers supprimés..."
        for file in "${deleted_files[@]}"; do
            commit_count=$((commit_count + 1))
            process_single_file "$file" "deleted" $commit_count $total_changes $commit_timestamp
            commit_timestamp=$((commit_timestamp + interval))
        done
    fi
    
    # Traiter les fichiers modifiés
    if [ ${#modified_files[@]} -gt 0 ]; then
        echo ""
        print_info "Traitement des fichiers modifiés..."
        for file in "${modified_files[@]}"; do
            commit_count=$((commit_count + 1))
            process_single_file "$file" "modified" $commit_count $total_changes $commit_timestamp
            commit_timestamp=$((commit_timestamp + interval))
        done
    fi
    
    # Traiter les nouveaux fichiers
    if [ ${#added_files[@]} -gt 0 ]; then
        echo ""
        print_info "Traitement des nouveaux fichiers..."
        for file in "${added_files[@]}"; do
            commit_count=$((commit_count + 1))
            process_single_file "$file" "added" $commit_count $total_changes $commit_timestamp
            commit_timestamp=$((commit_timestamp + interval))
        done
    fi
    
    # Reset
    unset GIT_COMMITTER_DATE
    unset GIT_AUTHOR_DATE
    
    print_success "Terminé! $commit_count commits créés"
}

# Fonction pour traiter un fichier individuel
process_single_file() {
    local file=$1
    local change_type=$2
    local current_count=$3
    local total=$4
    local timestamp=$5
    
    local commit_date=$(date -d "@$timestamp" +"%Y-%m-%d %H:%M:%S" 2>/dev/null)
    
    echo ""
    print_header "[$current_count/$total] $file"
    
    # Obtenir le message de commit
    local commit_message=$(get_cached_analysis "$file" "$change_type")
    
    # Aperçu
    preview_message "$commit_message"
    
    # Demander confirmation
    read -p "Utiliser ce message? (o/n/e:éditer) " -n 1 -r
    echo ""
    
    local final_message="$commit_message"
    if [[ $REPLY =~ ^[Ee]$ ]]; then
        echo "Entrez le message de commit (Ctrl+D pour terminer):"
        final_message=$(cat)
    elif [[ ! $REPLY =~ ^[Oo]$ ]]; then
        print_warning "Commit ignoré"
        return
    fi
    
    # Opérations git
    if [ "$change_type" = "deleted" ]; then
        git rm --cached "$file" > /dev/null 2>&1 || true
    else
        git add "$file" > /dev/null 2>&1 || true
    fi
    
    # Commit avec date backdatée
    export GIT_COMMITTER_DATE="$commit_date"
    export GIT_AUTHOR_DATE="$commit_date"
    
    if echo "$final_message" | git commit -F - > /dev/null 2>&1; then
        print_success "Commit créé: $(echo "$final_message" | head -n1)"
        print_info "Date: $commit_date"
    else
        local fallback_msg="refactor: update $(basename "$file")"
        git commit -m "$fallback_msg" > /dev/null 2>&1
        print_warning "Fallback: $fallback_msg"
    fi
}

# Fonction pour modifier les commits existants
edit_existing_commits() {
    print_header "Modification des messages de commits existants"
    
    local branch_name=$(git branch --show-current)
    print_info "Branche actuelle: $branch_name"
    
    # Sauvegarde
    local backup_branch="${BACKUP_BRANCH_PREFIX}-${branch_name}"
    git branch "$backup_branch"
    print_success "Sauvegarde créée: $backup_branch"
    
    # Compter les commits
    local commit_count=$(git log --oneline origin/$branch_name..HEAD 2>/dev/null | wc -l)
    if [ $commit_count -eq 0 ]; then
        print_warning "Aucun commit local non poussé trouvé"
        read -p "Voulez-vous modifier TOUS les commits de la branche? (o/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Oo]$ ]]; then
            return 0
        fi
        commit_count=$(git log --oneline | wc -l)
    fi
    
    print_info "$commit_count commits à traiter"
    
    # Récupérer la liste des commits
    local commits=()
    while IFS= read -r line; do
        commits+=("$line")
    done < <(git log --pretty=format:"%H %s" -n $commit_count | tac)
    
    local current=0
    for commit_line in "${commits[@]}"; do
        current=$((current + 1))
        local commit_hash=$(echo "$commit_line" | cut -d' ' -f1)
        local current_message=$(echo "$commit_line" | cut -d' ' -f2-)
        
        echo ""
        print_header "[$current/$commit_count] Commit: $commit_hash"
        print_info "Message actuel: $current_message"
        
        # Se positionner sur le commit
        git checkout "$commit_hash" > /dev/null 2>&1
        
        # Récupérer les fichiers du commit
        local files=$(git show --name-only --pretty=format: "$commit_hash")
        local diff=$(git show --stat "$commit_hash")
        
        # Générer nouveau message
        local prompt="Améliore ce message de commit en respectant le format Conventional Commits.

COMMIT ACTUEL:
$current_message

FICHIERS MODIFIÉS:
$files

STATISTIQUES DES CHANGEMENTS:
$diff

Génère un message de commit professionnel avec:
- Type approprié (feat/fix/docs/style/refactor/perf/test/chore)
- Scope pertinent
- Description claire (max 50 caractères)
- Corps expliquant le POURQUOI du changement

Réponds UNIQUEMENT avec le nouveau message de commit."

        # Appel Gemini
        local new_message=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{
                \"contents\": [{
                    \"parts\": [{
                        \"text\": $(echo "$prompt" | jq -Rs .)
                    }]
                }]
            }" \
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
            | jq -r '.candidates[0].content.parts[0].text // ""')
        
        # Nettoyer
        new_message=$(echo "$new_message" | sed 's/^```//g' | sed 's/```$//g')
        
        # Aperçu
        preview_message "$new_message"
        
        # Demander confirmation
        read -p "Appliquer ce message? (o/n/e:éditer/s:garder) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            git commit --amend -m "$new_message" > /dev/null 2>&1
            print_success "Message mis à jour"
        elif [[ $REPLY =~ ^[Ee]$ ]]; then
            git commit --amend
        else
            print_info "Message conservé"
        fi
        
        # Revenir à la branche et continuer le rebase
        git checkout "$branch_name" > /dev/null 2>&1
        if [ $current -lt $commit_count ]; then
            git rebase --continue 2>/dev/null || true
        fi
    done
    
    print_success "Tous les commits ont été traités!"
    
    # Push optionnel
    echo ""
    read -p "Voulez-vous forcer le push des modifications? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        git push --force-with-lease origin "$branch_name"
        print_success "Push forcé effectué!"
    fi
}

# Fonction pour analyser l'état actuel
analyze_current_state() {
    print_header "Analyse de l'état actuel"
    
    local branch=$(git branch --show-current)
    local last_commit=$(git log -1 --pretty=format:"%h - %s (%cr)" 2>/dev/null || echo "Aucun commit")
    local status_count=$(git status --porcelain | wc -l)
    local unpushed=$(git log --oneline origin/$branch..HEAD 2>/dev/null | wc -l)
    
    echo ""
    print_info "Branche: $branch"
    print_info "Dernier commit: $last_commit"
    print_info "Fichiers modifiés: $status_count"
    print_info "Commits non poussés: $unpushed"
    echo ""
    
    if [ $status_count -gt 0 ]; then
        print_warning "Modifications en attente:"
        git status --porcelain | while IFS= read -r line; do
            echo "   $line"
        done
    fi
}

# Menu principal
show_menu() {
    clear
    print_header "=== GESTIONNAIRE DE COMMITS INTELLIGENT ==="
    echo ""
    echo "1) Créer de nouveaux commits (avec backdating)"
    echo "2) Modifier des commits existants"
    echo "3) Analyser l'état actuel"
    echo "4) Afficher l'aide"
    echo "5) Quitter"
    echo ""
    read -p "Choisissez une option (1-5): " choice
    echo ""
    
    case $choice in
        1)
            read -p "Date de début [2025-12-01 09:00:00]: " start_date
            start_date=${start_date:-"2025-12-01 09:00:00"}
            create_new_commits "$start_date"
            ;;
        2)
            edit_existing_commits
            ;;
        3)
            analyze_current_state
            ;;
        4)
            print_header "AIDE"
            echo ""
            echo "Ce script permet de gérer vos commits Git intelligemment:"
            echo ""
            echo "📝 Création de commits:"
            echo "  - Analyse automatique des changements"
            echo "  - Détermination du type de commit (feat/fix/docs/...)"
            echo "  - Génération de messages professionnels"
            echo "  - Backdating automatique des dates"
            echo ""
            echo "✏️ Modification de commits:"
            echo "  - Amélioration des messages existants"
            echo "  - Sauvegarde automatique avant modification"
            echo "  - Format Conventional Commits"
            echo ""
            echo "📋 Format des messages:"
            echo "  <type>(<scope>): <description>"
            echo ""
            echo "  <corps>"
            echo ""
            echo "  [footer]"
            echo ""
            echo "🎯 Types disponibles:"
            echo "  feat: Nouvelle fonctionnalité"
            echo "  fix: Correction de bug"
            echo "  refactor: Remaniement de code"
            echo "  style: Changements de style"
            echo "  docs: Documentation"
            echo "  test: Tests"
            echo "  perf: Performance"
            echo "  chore: Maintenance"
            ;;
        5)
            print_success "Au revoir!"
            exit 0
            ;;
        *)
            print_error "Option invalide"
            ;;
    esac
    
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
}

# Point d'entrée principal
main() {
    check_dependencies
    
    while true; do
        show_menu
    done
}

# Lancer le script
main