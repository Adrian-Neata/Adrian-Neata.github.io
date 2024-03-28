import json
import sqlite3

con = sqlite3.connect("PlacesDataset.db")
cur = con.cursor()

# add RECORDS table to .json file
res = cur.execute("SELECT RECORDS.id, RECORDS.year, RECORDS.description from RECORDS").fetchall()
res_dict = {}
for record in res:
    res_dict[int(record[0])] = record

f = open("JavaScripts/data/records.js", 'w')
f.write('const RECORDS = ' + json.dumps(res_dict))
f.close()

# add PLACES table to .json file
res = cur.execute("SELECT PLACES.* FROM PLACES JOIN MENTIONS ON PLACES.id = MENTIONS.place_id WHERE MENTIONS.mention_status == 'finished'").fetchall()
res_dict = {}
for place in res:
    res_dict[int(place[0])] = place

f = open("JavaScripts/data/settlements.js", 'w')
f.write('const SETTLEMENTS = ' + json.dumps(res_dict))
f.close()

# add MENTIONS table to .json file
res = cur.execute("SELECT MENTIONS.*, RECORDS.year, 0 from MENTIONS, RECORDS where RECORDS.id == MENTIONS.record_id AND MENTIONS.mention_status == 'finished' AND MENTIONS.record_id != '6'").fetchall()
res_dict = {}
for mention in res:
    if mention[1] not in res_dict:
        res_dict[mention[1]] = {}
    res_dict[mention[1]][mention[0]] = mention

f = open("JavaScripts/data/mentions_settlements.js", 'w')
f.write('const MENTIONS_SETTLEMENTS = ' + json.dumps(res_dict))
f.close()


# add MONASTERIES table to .json file
res = cur.execute("SELECT MONASTERIES.* FROM MONASTERIES JOIN MENTIONS_MONASTERIES ON MONASTERIES.id = MENTIONS_MONASTERIES.monastery_id WHERE MENTIONS_MONASTERIES.mention_status == 'finished'").fetchall()
res_dict = {}
for place in res:
    place = list(place)
    place[0] = "_" + str(place[0])
    place = tuple(place)
    res_dict[place[0]] = place

f = open("JavaScripts/data/monasteries.js", 'w')
f.write('const MONASTERIES = ' + json.dumps(res_dict))
f.close()


# add MENTIONS_MONASTERIES table to .json file
res = cur.execute("SELECT MENTIONS_MONASTERIES.*, RECORDS.year, 1 from MENTIONS_MONASTERIES, RECORDS where RECORDS.id == MENTIONS_MONASTERIES.record_id AND MENTIONS_MONASTERIES.mention_status == 'finished'").fetchall()
res_dict = {}
for mention in res:
    mention = list(mention)
    mention[1] = "_" + str(mention[1])
    mention = tuple(mention)
    if mention[1] not in res_dict:
        res_dict[mention[1]] = {}
    res_dict[mention[1]][mention[0]] = mention

f = open("JavaScripts/data/mentions_monasteries.js", 'w')
f.write('const MENTIONS_MONASTERIES = ' + json.dumps(res_dict))
f.close()

# res = cur.execute("SELECT DISTINCT place_county FROM MENTIONS WHERE MENTIONS.mention_status == 'finished'").fetchall()
# res_dict = {}
# for county in res:
#     res_dict[county[0]] = ''
# print(res_dict)