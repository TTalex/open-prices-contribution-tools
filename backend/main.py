from typing import List, Any, Dict
from fastapi import File, UploadFile, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import typing_extensions as typing
import json
import PIL.Image
import enum
import requests
from dotenv import load_dotenv
import os


load_dotenv()

OPEN_PRICES_API_PATH = "https://prices.openfoodfacts.org/api/v1"
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

class Products(enum.Enum):
    OTHER = "other"
    APPLES = "en:apples"
    APRICOTS = "en:apricots"
    ARTICHOKES = "en:artichokes"
    ASPARAGUS = "en:asparagus"
    AUBERGINES = "en:aubergines"
    AVOCADOS = "en:avocados"
    BANANAS = "en:bananas"
    BEET = "en:beet"
    BERRIES = "en:berries"
    BLACKBERRIES = "en:blackberries"
    BLUEBERRIES = "en:blueberries"
    BOK_CHOY = "en:bok-choy"
    BROCCOLI = "en:broccoli"
    CABBAGES = "en:cabbages"
    CARROTS = "en:carrots"
    CAULIFLOWERS = "en:cauliflowers"
    CELERY = "en:celery"
    CELERY_STALK = "en:celery-stalk"
    CEP_MUSHROOMS = "en:cep-mushrooms"
    CHANTERELLES = "en:chanterelles"
    CHERRIES = "en:cherries"
    CHERRY_TOMATOES = "en:cherry-tomatoes"
    CHICKPEAS = "en:chickpeas"
    CHIVES = "en:chives"
    CLEMENTINES = "en:clementines"
    COCONUTS = "en:coconuts"
    CRANBERRIES = "en:cranberries"
    CUCUMBERS = "en:cucumbers"
    DATES = "en:dates"
    ENDIVES = "en:endives"
    FIGS = "en:figs"
    GARLIC = "en:garlic"
    GINGER = "en:ginger"
    GRAPEFRUITS = "en:grapefruits"
    GRAPES = "en:grapes"
    GREEN_BEANS = "en:green-beans"
    KIWIS = "en:kiwis"
    KAKIS = "en:kakis"
    LEEKS = "en:leeks"
    LEMONS = "en:lemons"
    LETTUCES = "en:lettuces"
    LIMES = "en:limes"
    LYCHEES = "en:lychees"
    MANDARIN_ORANGES = "en:mandarin-oranges"
    MANGOES = "en:mangoes"
    MELONS = "en:melons"
    MUSHROOMS = "en:mushrooms"
    NECTARINES = "en:nectarines"
    ONIONS = "en:onions"
    ORANGES = "en:oranges"
    PAPAYAS = "en:papayas"
    PASSION_FRUITS = "en:passion-fruits"
    PEACHES = "en:peaches"
    PEARS = "en:pears"
    PEAS = "en:peas"
    PEPPERS = "en:peppers"
    PINEAPPLE = "en:pineapple"
    PLUMS = "en:plums"
    POMEGRANATES = "en:pomegranates"
    POMELOS = "en:pomelos"
    POTATOES = "en:potatoes"
    PUMPKINS = "en:pumpkins"
    RADISHES = "en:radishes"
    RASPBERRIES = "en:raspberries"
    RHUBARBS = "en:rhubarbs"
    SCALLIONS = "en:scallions"
    SHALLOTS = "en:shallots"
    SPINACHS = "en:spinachs"
    SPROUTS = "en:sprouts"
    STRAWBERRIES = "en:strawberries"
    TOMATOES = "en:tomatoes"
    TURNIP = "en:turnip"
    WATERMELONS = "en:watermelons"
    WALNUTS = "en:walnuts"
    ZUCCHINI = "en:zucchini"

class Origin(enum.Enum):
    FRANCE = "en:france"
    ITALY = "en:italy"
    SPAIN = "en:spain"
    POLAND = "en:poland"
    CHINA = "en:china"
    BELGIUM = "en:belgium"
    MOROCCO = "en:morocco"
    PERU = "en:peru"
    PORTUGAL = "en:portugal"
    MEXICO = "en:mexico"
    OTHER = "other"
    UNKNOWN = "unknown"

class Unit(enum.Enum):
    KILOGRAM = "KILOGRAM"
    UNIT = "UNIT"

class Label(typing.TypedDict):
    product: Products
    price: float
    origin: Origin
    unit: Unit
    organic: bool

class Labels(typing.TypedDict):
    labels: list[Label]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
def upload(files: List[UploadFile]):
    sample_files = [PIL.Image.open(file.file) for file in files]
    response = model.generate_content(
        ["Here are " + str(len(sample_files)) + " pictures containing a label. For each picture of a label, please extract all the following attributes: the product category matching product name, the origin category matching country of origin, the price, is the product organic, and the unit (per KILOGRAM or per UNIT). I expect a list of " + str(len(sample_files)) + " labels in your reply, no more, no less. If you cannot decode an attribute, set it to an empty string"] + sample_files,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json", response_schema=Labels
        )
    )
    vals = json.loads(response.text)
    return vals

@app.post("/proofs/upload")
def proofUpload(file: UploadFile, type: str, location_osm_id: str, location_osm_type: str, date: str, currency: str, access_token: str):
    data = {
        "type": type,
        "location_osm_id": location_osm_id,
        "location_osm_type": location_osm_type,
        "date": date,
        "currency": currency,
    }
    headers = {
        "Authorization": "Bearer " + access_token
    }
    res = requests.post(OPEN_PRICES_API_PATH + "/proofs/upload", data=data, headers=headers, files={"file": ("label.webp", file.file, "image/webp")})
    print(res.text)
    return res.json()

@app.post("/prices")
def prices(request: Dict[Any, Any]):
    headers = {
        "Authorization": "Bearer " + request["access_token"]
    }
    request["origins_tags"] = json.dumps(request["origins_tags"] or [])
    request["labels_tags"] = json.dumps(request["labels_tags"] or [])
    res = requests.post(OPEN_PRICES_API_PATH + "/prices", headers=headers, data=request)
    print(res.text)
    return res.json()