import json
import sqlite3

con = sqlite3.connect("PlacesDataset.db")
cur = con.cursor()

res = cur.execute("SELECT MENTIONS.place_name, MENTIONS.place_latitude, MENTIONS.place_longitude, MENTIONS.place_status, RECORDS.year, MENTIONS.place_id, MENTIONS.record_id, MENTIONS.notes, 0 from MENTIONS, RECORDS where RECORDS.id == MENTIONS.record_id").fetchall()

f = open("JavaScripts/mentions_places.js", 'w')
f.write('var mentions_places = ' + json.dumps(res))
f.close()

res = cur.execute("SELECT MENTIONS_MONASTERIES.place_name, MENTIONS_MONASTERIES.place_latitude, MENTIONS_MONASTERIES.place_longitude, MENTIONS_MONASTERIES.place_status, RECORDS.year, MENTIONS_MONASTERIES.monastery_id, MENTIONS_MONASTERIES.record_id, MENTIONS_MONASTERIES.notes, 1 from MENTIONS_MONASTERIES, RECORDS where RECORDS.id == MENTIONS_MONASTERIES.record_id").fetchall()


f = open("JavaScripts/mentions_monasteries.js", 'w')
f.write('var mentions_monasteries = ' + json.dumps(res))
f.close()

res = cur.execute("SELECT RECORDS.id, RECORDS.year, RECORDS.description from RECORDS").fetchall()

f = open("JavaScripts/records.js", 'w')
f.write('var records = ' + json.dumps(res))
f.close()