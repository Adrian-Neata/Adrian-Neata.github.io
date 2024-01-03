import json
import sqlite3

con = sqlite3.connect("PlacesDataset.db")
cur = con.cursor()

res = cur.execute("SELECT MENTIONS.*, RECORDS.year, 0 from MENTIONS, RECORDS where RECORDS.id == MENTIONS.record_id AND MENTIONS.mention_status == 'finished'").fetchall()

f = open("JavaScripts/mentions_places.js", 'w')
f.write('var mentions_places = ' + json.dumps(res))
f.close()

res = cur.execute("SELECT MENTIONS_MONASTERIES.*, RECORDS.year, 1 from MENTIONS_MONASTERIES, RECORDS where RECORDS.id == MENTIONS_MONASTERIES.record_id AND MENTIONS_MONASTERIES.mention_status == 'finished'").fetchall()


f = open("JavaScripts/mentions_monasteries.js", 'w')
f.write('var mentions_monasteries = ' + json.dumps(res))
f.close()

res = cur.execute("SELECT RECORDS.id, RECORDS.year, RECORDS.description from RECORDS").fetchall()
res_dict = {}
for record in res:
    res_dict[int(record[0])] = record

f = open("JavaScripts/records.js", 'w')
f.write('var records = ' + json.dumps(res_dict))
f.close()

res = cur.execute("SELECT PLACES.* FROM PLACES JOIN MENTIONS ON PLACES.id = MENTIONS.place_id WHERE MENTIONS.mention_status == 'finished'").fetchall()
res_dict = {}
for place in res:
    res_dict[int(place[0])] = place

f = open("JavaScripts/places.js", 'w')
f.write('var places = ' + json.dumps(res_dict))
f.close()

# res = cur.execute("SELECT DISTINCT place_county FROM MENTIONS").fetchall()
# res_dict = {}
# for county in res:
#     res_dict[county[0]] = ''
# print(res_dict)