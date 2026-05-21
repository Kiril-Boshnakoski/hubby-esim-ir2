import math

# ==========================================
# ПЕТАР - Твоите 3 функции
# ==========================================

def rating_score(rating):
    if not rating:
        return 0.0
    return float(rating) / 5.0

def get_category_relevance(activity_type, context):
    if not context or not activity_type:
        return 0.0
    
    activity_type_lower = activity_type.lower()
    context_lowercase = [item.lower() for item in context]
    
    return 1.0 if activity_type_lower in context_lowercase else 0.0

def calculate_score(act, dist_km, radius_km, context):
    d_score = distance_score(dist_km, radius_km)
    p_score = popularity_score(act.get('user_rating_count', 0))
    
    r_score = rating_score(act.get('rating', 0.0))
    c_score = get_category_relevance(act.get('activity_type'), context)
    
    score = (d_score * 0.35) + (r_score * 0.30) + (p_score * 0.20) + (c_score * 0.15)
    return round(score, 4)

# ==========================================
# МАКСИМ - Негови функции (Оставени да ги допише)
# ==========================================

# ==========================================
# МАКСИМ - Привремено „лажирани“ вредности за тест
# ==========================================
def distance_score(distance_km, radius_km):
    return 0.5  # <--- Смени го ова од pass во return 0.5

def popularity_score(user_rating_count):
    return 0.5  # <--- Смени го ова од pass во return 0.5

if __name__ == "__main__":
    print("=== Стартува локален тест за функциите на Петар ===")
    
    # 1. Тест за rating_score
    print("\n1. Тестирање на rating_score:")
    print(f"За рејтинг 4.5 требa да биде 0.9 -> Добиено: {rating_score(4.5)}")
    print(f"За рејтинг None треба да биде 0.0 -> Добиено: {rating_score(None)}")
    
    # 2. Тест за get_category_relevance
    print("\n2. Тестирање на get_category_relevance:")
    тест_контекст = ["lunch", "food", "restaurant"]
    print(f"Ако е во контекст ('Lunch') треба 1.0 -> Добиено: {get_category_relevance('Lunch', тест_контекст)}")
    print(f"Ако НЕ Е во контекст ('Museum') треба 0.0 -> Добиено: {get_category_relevance('Museum', тест_контекст)}")
    
    # 3. Тест за calculate_score (Со лажираните 0.5 од Максим)
    print("\n3. Тестирање на calculate_score:")
    лажна_активност = {
        "activity_type": "lunch",
        "rating": 5.0,
        "user_rating_count": 100
    }
    # Математика: 
    # d_score(0.5)*0.35 + r_score(1.0)*0.30 + p_score(0.5)*0.20 + c_score(1.0)*0.15
    # 0.175 + 0.30 + 0.10 + 0.15 = 0.725
    резултат = calculate_score(лажна_активност, dist_km=0.5, radius_km=1.0, context=тест_контекст)
    print(f"Очекуван вкупен скор: 0.725 -> Добиен скор: {резултат}")