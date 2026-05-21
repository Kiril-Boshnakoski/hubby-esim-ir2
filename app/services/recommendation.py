import math

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

def distance_score(distance_km, radius_km):
    if radius_km <= 0:
        return 0.0
    
    score = 1.0 - (distance_km / radius_km)
    # Спречува негативен скор доколку локацијата е надвор од радиусот
    return max(0.0, score) 

def popularity_score(user_rating_count):
    if user_rating_count <= 0:
        return 0.0
    
    score = math.log10(user_rating_count + 1) / 4.0
    return min(score, 1.0)


if __name__ == "__main__":
    print("=== Стартува локален тест за функциите на Петар и Максим ===")
    
    # 1. Тест за rating_score
    print("\n1. Тестирање на rating_score:")
    print(f"За рејтинг 4.5 требa да биде 0.9 -> Добиено: {rating_score(4.5)}")
    print(f"За рејтинг None треба да биде 0.0 -> Добиено: {rating_score(None)}")
    
    # 2. Тест за get_category_relevance
    print("\n2. Тестирање на get_category_relevance:")
    тест_контекст = ["lunch", "food", "restaurant"]
    print(f"Ако е во контекст ('Lunch') треба 1.0 -> Добиено: {get_category_relevance('Lunch', тест_контекст)}")
    print(f"Ако НЕ Е во контекст ('Museum') треба 0.0 -> Добиено: {get_category_relevance('Museum', тест_контекст)}")
    
    # 3. Нови тестови за Максим: distance_score
    print("\n3. Тестирање на distance_score (Максим):")
    print(f"Дистанца 0.1км на радиус 1.0км (Очекувано: ~0.9) -> Добиено: {round(distance_score(0.1, 1.0), 2)}")
    print(f"Дистанца 0.5км на радиус 1.0км (Очекувано: 0.5) -> Добиено: {round(distance_score(0.5, 1.0), 2)}")
    print(f"Дистанца 1.0км на радиус 1.0км (Очекувано: 0.0) -> Добиено: {round(distance_score(1.0, 1.0), 2)}")
    
    # 4. Нови тестови за Максим: popularity_score
    print("\n4. Тестирање на popularity_score (Максим):")
    print(f"Рејтинг каунт 0 (Очекувано: 0.0) -> Добиено: {round(popularity_score(0), 2)}")
    print(f"Рејтинг каунт 10 (Очекувано: ~0.26) -> Добиено: {round(popularity_score(10), 2)}")
    print(f"Рејтинг каунт 100 (Очекувано: ~0.50) -> Добиено: {round(popularity_score(100), 2)}")
    print(f"Рејтинг каунт 10000 (Очекувано: 1.0) -> Добиено: {round(popularity_score(10000), 2)}")

    # 5. Тест за calculate_score (Со вистинските пресметки сега)
    print("\n5. Тестирање на крајниот calculate_score:")
    активност = {
        "activity_type": "lunch",
        "rating": 5.0,
        "user_rating_count": 100
    }
    # Математика зад пресметката: 
    # d_score = 1 - (0.5/1.0) = 0.5
    # r_score = 5.0 / 5.0 = 1.0
    # p_score = log10(101)/4 = 2.0043 / 4 = 0.5011
    # c_score = 1.0
    # Вкупно: (0.5 * 0.35) + (1.0 * 0.30) + (0.5011 * 0.20) + (1.0 * 0.15)
    #          0.175       +  0.30       +  0.10022     +  0.15  = 0.7252
    резултат = calculate_score(активност, dist_km=0.5, radius_km=1.0, context=тест_контекст)
    print(f"Очекуван вкупен скор: ~0.7252 -> Добиен скор: {резултат}")