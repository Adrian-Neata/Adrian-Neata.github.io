import json
import sqlite3

con = sqlite3.connect("PlacesDataset.db")
cur = con.cursor()
res = cur.execute("SELECT MENTIONS.place_name, MENTIONS.place_latitude, MENTIONS.place_longitude, MENTIONS.place_status, RECORDS.year, MENTIONS.place_id, MENTIONS.notes from MENTIONS, RECORDS where RECORDS.id == MENTIONS.record_id").fetchall()

f = open("mentions.js", 'w')
f.write('var mentions = ' + json.dumps(res))
f.close()