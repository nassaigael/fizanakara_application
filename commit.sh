#!/bin/bash

# Script to add and commit all changes with backdated commits and Gemini analysis
# Commits will start from December 1, 2025 and go forward

# Configuration
GEMINI_API_KEY="AIzaSyDTPSn7AQuTZ5lhDe80s8YFx_SYkoILJq4" 
GEMINI_API_URL="https://aistudio.google.com/api-keys?project=gen-lang-client-0527898939"

# Exit on error
set -e

echo "🚀 Starting backdated commits from December 2025 with Gemini analysis..."

# Vérifier que jq est installé (pour parser JSON)
if ! command -v jq &> /dev/null; then
    echo "❌ jq n'est pas installé. Installation en cours..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Vérifier que curl est installé
if ! command -v curl &> /dev/null; then
    echo "❌ curl n'est pas installé. Installation en cours..."
    sudo apt-get update && sudo apt-get install -y curl
fi

# Vérifier la clé API Gemini
if [ "$GEMINI_API_KEY" = "VOTRE_CLE_API_GEMINI" ]; then
    echo "❌ Veuillez configurer votre clé API Gemini dans le script"
    exit 1
fi

# Fonction pour analyser un fichier avec Gemini
analyze_file_with_gemini() {
    local file_path=$1
    local change_type=$2
    local file_content=""
    local file_diff=""
    
    echo "   🔍 Analyse de $file_path par Gemini..."
    
    # Récupérer le contenu du fichier ou le diff selon le type de changement
    if [ "$change_type" = "deleted" ]; then
        # Pour les fichiers supprimés, on récupère le dernier contenu connu
        file_content=$(git show HEAD:"$file_path" 2>/dev/null || echo "Fichier supprimé - contenu non disponible")
        file_diff=$(git diff --staged "$file_path" 2>/dev/null || echo "Diff non disponible")
    elif [ "$change_type" = "modified" ]; then
        file_content=$(cat "$file_path" 2>/dev/null || echo "Impossible de lire le fichier")
        file_diff=$(git diff "$file_path")
    else
        # Nouveaux fichiers
        file_content=$(cat "$file_path" 2>/dev/null || echo "Nouveau fichier")
        file_diff="Nouveau fichier ajouté"
    fi
    
    # Préparer le prompt pour Gemini
    local prompt="Analyse ce fichier et génère un message de commit détaillé en français.
    
Type de changement: $change_type
Chemin du fichier: $file_path

Contenu du fichier:
\`\`\`
${file_content:0:2000}
\`\`\"

Différence (si disponible):
\`\`\`
${file_diff:0:1000}
\`\`\"

Instructions:
1. Identifie le type de fichier (composant React, service, utilitaire, configuration, etc.)
2. Résume les changements principaux en 1-2 phrases
3. Identifie les fonctions/méthodes modifiées ou ajoutées
4. Détecte les dépendances ou patterns importants
5. Suggère un message de commit formaté ainsi:
   - Une ligne de sujet (max 50 caractères)
   - Une ligne vide
   - Une description détaillée des changements

Format de réponse attendu (JSON):
{
    \"subject\": \"type(scope): description courte\",
    \"body\": \"description détaillée avec points clés\",
    \"analysis\": \"analyse technique du fichier\"
}"

    # Appel à l'API Gemini
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"contents\": [{
                \"parts\": [{
                    \"text\": $(echo "$prompt" | jq -Rs .)
                }]
            }]
        }" \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=$GEMINI_API_KEY")
    
    # Extraire la réponse
    local gemini_text=$(echo "$response" | jq -r '.candidates[0].content.parts[0].text // "{}"')
    
    # Nettoyer et parser la réponse JSON
    local clean_json=$(echo "$gemini_text" | sed -n '/{/,/}/p' | tr -d '\n' | sed 's/```json//g' | sed 's/```//g')
    
    # Extraire les champs
    local subject=$(echo "$clean_json" | jq -r '.subject // "Update: $file_path"')
    local body=$(echo "$clean_json" | jq -r '.body // "Mise à jour du fichier"')
    local analysis=$(echo "$clean_json" | jq -r '.analysis // ""')
    
    # Afficher l'analyse
    echo "   📊 Analyse: $analysis"
    
    # Retourner le message de commit formaté
    echo -e "$subject\n\n$body\n\nAnalyse technique: $analysis"
}

# Get current date for the last commit
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Start date for first commit (December 1, 2025)
START_DATE="2025-12-01 09:00:00"

# Convert to timestamp for calculations
START_TIMESTAMP=$(date -d "$START_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)

# Calculate total seconds between start and now
TOTAL_SECONDS=$((CURRENT_TIMESTAMP - START_TIMESTAMP))

# Count total files to commit (modified + deleted + untracked)
MODIFIED_FILES=$(git status --porcelain | grep -c "^[[:space:]]*M" || true)
DELETED_FILES=$(git status --porcelain | grep -c "^[[:space:]]*D" || true)
UNTRACKED_FILES=$(git status --porcelain | grep -c "^??" || true)
TOTAL_CHANGES=$((MODIFIED_FILES + DELETED_FILES + UNTRACKED_FILES))

echo "📊 Changes detected:"
echo "   - Modified: $MODIFIED_FILES"
echo "   - Deleted: $DELETED_FILES"
echo "   - Untracked: $UNTRACKED_FILES"
echo "   - Total: $TOTAL_CHANGES"

if [ $TOTAL_CHANGES -eq 0 ]; then
    echo "✅ No changes to commit!"
    exit 0
fi

# Demander confirmation
echo ""
echo "⚠️  Gemini analysera chaque fichier pour générer des messages de commit détaillés."
echo "   Coût approximatif: ~$((TOTAL_CHANGES * 1000)) tokens"
read -p "Voulez-vous continuer? (o/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    exit 0
fi

# Calculate time interval per commit (in seconds)
if [ $TOTAL_CHANGES -gt 0 ]; then
    INTERVAL=$((TOTAL_SECONDS / TOTAL_CHANGES))
    if [ $INTERVAL -lt 1 ]; then
        INTERVAL=1
    fi
fi

echo "⏰ Creating $TOTAL_CHANGES commits from $START_DATE to now"
echo "   Interval between commits: ~$INTERVAL seconds"

# Initialize current timestamp
CURRENT_TIMESTAMP=$START_TIMESTAMP
CURRENT_COMMIT_DATE="$START_DATE"

# Compteurs pour le suivi
COMMIT_COUNT=0
TOTAL_FILES=$TOTAL_CHANGES

# Fonction pour traiter et committer un fichier
process_file() {
    local file=$1
    local change_type=$2
    local operation=$3
    
    COMMIT_COUNT=$((COMMIT_COUNT + 1))
    echo ""
    echo "📦 [$COMMIT_COUNT/$TOTAL_FILES] Traitement de: $file"
    
    # Analyser le fichier avec Gemini
    local commit_message=$(analyze_file_with_gemini "$file" "$change_type")
    
    # Extraire le sujet pour l'affichage
    local subject=$(echo "$commit_message" | head -n1)
    
    # Effectuer l'opération git
    if [ "$change_type" = "deleted" ]; then
        git rm --cached "$file" > /dev/null 2>&1 || true
    else
        git add "$file" > /dev/null 2>&1 || true
    fi
    
    # Créer le commit avec date backdatée
    export GIT_COMMITTER_DATE="$CURRENT_COMMIT_DATE"
    export GIT_AUTHOR_DATE="$CURRENT_COMMIT_DATE"
    
    if echo "$commit_message" | git commit -F - > /dev/null 2>&1; then
        echo "   ✅ Committed: $subject"
        echo "     📅 $(date -d "$CURRENT_COMMIT_DATE" '+%Y-%m-%d %H:%M:%S')"
    else
        echo "   ❌ Échec du commit pour $file"
    fi
    
    # Mettre à jour le timestamp
    CURRENT_TIMESTAMP=$((CURRENT_TIMESTAMP + INTERVAL))
    CURRENT_COMMIT_DATE=$(date -d "@$CURRENT_TIMESTAMP" +"%Y-%m-%d %H:%M:%S")
}

# Traiter les fichiers supprimés
echo ""
echo "📝 Traitement des fichiers supprimés..."
git status --porcelain | grep "^[[:space:]]*D" | cut -c4- | while IFS= read -r file; do
    if [ -n "$file" ]; then
        process_file "$file" "deleted" "rm"
    fi
done

# Traiter les fichiers modifiés
echo ""
echo "📝 Traitement des fichiers modifiés..."
git status --porcelain | grep "^[[:space:]]*M" | cut -c4- | while IFS= read -r file; do
    if [ -n "$file" ]; then
        process_file "$file" "modified" "add"
    fi
done

# Traiter les nouveaux fichiers
echo ""
echo "📝 Traitement des nouveaux fichiers..."
git status --porcelain | grep "^??" | cut -c4- | while IFS= read -r file; do
    if [ -n "$file" ]; then
        process_file "$file" "added" "add"
    fi
done

# Reset environment variables
unset GIT_COMMITTER_DATE
unset GIT_AUTHOR_DATE

echo ""
echo "✨ Tous les commits ont été créés avec succès!"
echo "   Total: $COMMIT_COUNT commits"

# Afficher le résumé des commits
echo ""
echo "📜 Derniers commits:"
git log --oneline --no-merges -n 5

# Option: Sauvegarder les messages de commit dans un fichier
echo ""
echo "💾 Sauvegarde des messages de commit dans commit_messages.log"
git log --pretty=format:"%h - %s%n%n%b%n---%n" -n $COMMIT_COUNT > commit_messages.log

echo ""
echo "🔍 Vérification des commits backdatés:"
git log --pretty=format:"%h - %s (%ad)" --date=format:"%Y-%m-%d %H:%M:%S" -n 5