import pymorphy3
import re

morph = pymorphy3.MorphAnalyzer()

# Словари для перевода тегов pymorphy3 на русский язык
POS_MAP = {
    'NOUN': 'Существительное', 'ADJF': 'Прилагательное (полное)', 'ADJS': 'Прилагательное (краткое)',
    'COMP': 'Компаратив', 'VERB': 'Глагол (личная форма)', 'INFN': 'Глагол (инфинитив)',
    'PRTF': 'Причастие (полное)', 'PRTS': 'Причастие (краткое)', 'GRCH': 'Деепричастие',
    'NUMR': 'Числительное', 'ADVB': 'Наречие', 'NPRO': 'Местоимение-существительное',
    'PRED': 'Предикатив', 'PREP': 'Предлог', 'CONJ': 'Союз', 'PRCL': 'Частица',
    'INTJ': 'Междометие'
}

GENDER_MAP = {'masc': 'мужской', 'femn': 'женский', 'neut': 'средний'}
NUMBER_MAP = {'sing': 'единственное', 'plur': 'множественное'}
ANIMACY_MAP = {'anim': 'одушевлённое', 'inan': 'неодушевлённое'}
ASPECT_MAP = {'perf': 'совершенный', 'impf': 'несовершенный'}

CASE_MAP = {
    'nomn': 'Именительный', 'gent': 'Родительный', 'datv': 'Дательный',
    'accs': 'Винительный', 'ablt': 'Творительный', 'loct': 'Предложный',
    'voct': 'Звательный', 'gen2': 'Второй родительный', 'acc2': 'Второй винительный',
    'loc2': 'Второй предложный'
}

def analyze_word_v2(word):
    word = word.strip().lower()
    parsed = morph.parse(word)[0]
    pos = parsed.tag.POS
    
    immutable_pos = {'ADVB', 'COMP', 'PREP', 'CONJ', 'PRCL', 'INTJ'}
    
    if pos in immutable_pos:
        return word, "", parsed
        
    normal_form = parsed.normal_form
    
    common_part = ""
    for i in range(min(len(word), len(normal_form))):
        if word[i] == normal_form[i]:
            common_part += word[i]
        else:
            break
            
    if common_part:
        stem = common_part
        if len(stem) < len(word):
            while len(stem) < len(word) and word[len(stem)] not in 'аеёиоуыэюя':
                stem += word[len(stem)]
    else:
        stem = word

    ending = word[len(stem):]
    return stem, ending, parsed

def analyze_sentence(sentence):
    words = re.findall(r'[а-яА-ЯёЁ]+', sentence)
    result = []
    
    for w in words:
        stem, ending, parsed = analyze_word_v2(w)
        
        # Собираем читаемые характеристики
        features = []
        
        # 1. Часть речи
        pos_ru = POS_MAP.get(parsed.tag.POS, str(parsed.tag.POS))
        
        # 2. Постоянные и непостоянные признаки
        if parsed.tag.animacy:
            features.append(ANIMACY_MAP.get(parsed.tag.animacy))
        if parsed.tag.gender:
            features.append(f"{GENDER_MAP.get(parsed.tag.gender)} род")
        if parsed.tag.number:
            features.append(f"{NUMBER_MAP.get(parsed.tag.number)} число")
        if parsed.tag.case:
            features.append(f"{CASE_MAP.get(parsed.tag.case)} падеж")
        if parsed.tag.aspect:
            features.append(f"{ASPECT_MAP.get(parsed.tag.aspect)} вид")
            
        result.append({
            "word": w,
            "lemma": parsed.normal_form,
            "stem": stem,
            "ending": ending,
            "pos": pos_ru,
            "features": ", ".join(filter(None, features))
        })
    return result