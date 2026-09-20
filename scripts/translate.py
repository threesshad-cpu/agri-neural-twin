import json
import os
from deep_translator import GoogleTranslator
import time

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '../src/locales')
EN_FILE = os.path.join(LOCALES_DIR, 'en.json')
TARGETS = ['ta', 'te', 'kn', 'ml', 'ur']

# Load English JSON
with open(EN_FILE, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

def translate_text(text, target_lang):
    if not isinstance(text, str):
        return text
    if not text.strip():
        return text
    # Avoid translating placeholder tokens like {{something}}
    # But for a simple approach, we'll let Google handle it, it usually preserves {{...}}
    try:
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        time.sleep(0.5) # Avoid rate limits
        return translated
    except Exception as e:
        print(f"Error translating '{text}' to {target_lang}: {e}")
        return text

def sync_dict(en_dict, target_dict, target_lang):
    for key, value in en_dict.items():
        if isinstance(value, dict):
            if key not in target_dict or not isinstance(target_dict[key], dict):
                target_dict[key] = {}
            sync_dict(value, target_dict[key], target_lang)
        else:
            if key not in target_dict:
                print(f"Translating new key '{key}' to {target_lang}...")
                target_dict[key] = translate_text(value, target_lang)
    return target_dict

for lang in TARGETS:
    lang_file = os.path.join(LOCALES_DIR, f"{lang}.json")
    if os.path.exists(lang_file):
        with open(lang_file, 'r', encoding='utf-8') as f:
            target_data = json.load(f)
    else:
        target_data = {}
    
    print(f"\n--- Syncing {lang.upper()} ---")
    updated_data = sync_dict(en_data, target_data, lang)
    
    with open(lang_file, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=4)
        
print("All languages synchronized successfully.")
