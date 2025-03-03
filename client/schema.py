import graphene
from graphene import ObjectType, List, String, Float
import json

class ProductType(ObjectType):
    id = String()
    name = String()
    price = Float()
    description = String()
    categories = List(String)

class Query(ObjectType):
    products = List(ProductType, category=String())

    def resolve_products(self, info, category=None):
        with open('database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        products = data['products']
        if category:
            products = [p for p in products if category in p['categories']]
        return products

schema = graphene.Schema(query=Query)