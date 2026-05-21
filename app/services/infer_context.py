
CONTEXT_KEYWORDS = {
    'breakfast': [
        'bakery',
        'cafe',
        'cake_shop',
        'coffee_shop',
        'donut_shop',
        'pastry_shop'
    ],
    'lunch': [
        'cafeteria',
        'fast_food_restaurant',
        'hamburger_restaurant',
        'meal_takeaway',
        'pizza_restaurant',
        'sushi_restaurant'
    ],
    'dinner': [
        'barbecue_restaurant',
        'bistro',
        'eastern_european_restaurant',
        'italian_restaurant',
        'restaurant',
        'dessert_restaurant'
        'seafood_restaurant',
        'soul_food_restaurant'
    ],
    'nightlife': [
        'bar',
        'gastropub',
        'irish_pub',
        'lounge_bar',
        'wine_bar'
    ],
    'other': [
        'art_gallery',
        'art_museum',
        'bridge',
        'church',
        'cultural_center',
        'event_venue',
        'gas_station',
        'history_museum',
        'hotel',
        'mosque',
        'movie_theater',
        'museum',
        'other',
        'playground',
        'tourist_attraction'
    ]
}

def infer_context(timestamp):
    if timestamp.hour >= 6 and timestamp.hour <= 11:
        return 'breakfast'
    elif timestamp.hour >= 12 and timestamp.hour <= 16:
        return 'lunch'
    elif timestamp.hour >= 17 and timestamp.hour <= 21:
        return 'dinner'
    else:
        return 'nightlife'

def get_category_relevance(activity_type, context):
    if activity_type in CONTEXT_KEYWORDS.get(context, []):
        return 1.0
    elif activity_type in CONTEXT_KEYWORDS.get('other', []):
        return 0.5
    else:
        return 0.0