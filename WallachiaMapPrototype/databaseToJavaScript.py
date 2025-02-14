import json
import sqlite3

s1 = '"'
s2 = '\\"'
con = sqlite3.connect("PlacesDataset.db")
cur = con.cursor()

# add MEDIEVAL_DOCUMENTS_COLLECTIONS table to .json file
res = cur.execute("SELECT MEDIEVAL_DOCUMENTS_COLLECTIONS.* from MEDIEVAL_DOCUMENTS_COLLECTIONS").fetchall()
js_code = 'MEDIEVAL_DOCUMENTS_COLLECTIONS={}\n'
for record in res:
    record = list(record)
    for i in range(len(record)):
        if isinstance(record[i], str):
            record[i] = record[i].replace(s1, s2)
    js_code += f'MEDIEVAL_DOCUMENTS_COLLECTIONS["{record[0]}"] = new MedievalDocumentCollection("{record[0]}", "{record[1]}", "{record[2]}", {int(record[3])}, "{record[4]}");\n'
js_code = js_code.replace('"None"', "null")

f = open("JavaScripts/data/medieval_documents_collections.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote medieval_documents_collections.js")

# add MEDIEVAL_DOCUMENTS table to .json file
res = cur.execute("SELECT MEDIEVAL_DOCUMENTS.* from MEDIEVAL_DOCUMENTS").fetchall()
js_code = ''
for record in res:
    record = list(record)
    for i in range(len(record)):
        if isinstance(record[i], str):
            record[i] = record[i].replace(s1, s2)
    js_code += f'RECORDS["_{record[0]}"] = new MedievalDocuments("_{record[0]}", {record[1]}, "{record[2]}", "{record[3]}", "{record[4]}", "{record[5]}", "{record[6]}", "{record[7]}", "{record[8]}", "{record[9]}", "{record[10]}", "{record[11]}");\n'
js_code = js_code.replace('"None"', "null")

f = open("JavaScripts/data/medieval_documents.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote medieval_documents.js")

# add RECORDS table to .json file
res = cur.execute("SELECT RECORDS.id, RECORDS.year, RECORDS.description from RECORDS").fetchall()
js_code = 'const RECORDS = {'
for record in res:
    record = list(record)
    for i in range(len(record)):
        if isinstance(record[i], str):
            record[i] = record[i].replace(s1, s2)
    js_code += f'"{record[0]}":  new Record("{record[0]}", {record[1]}, "{record[2]}"),\n'
js_code += '}'
js_code = js_code.replace('"None"', "null")

f = open("JavaScripts/data/records.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote records.js")

# add PLACES table to .json file
res = cur.execute("SELECT DISTINCT PLACES.* FROM PLACES JOIN MENTIONS ON PLACES.id = MENTIONS.place_id WHERE MENTIONS.mention_status == 'finished'").fetchall()
js_code = 'const SETTLEMENTS = {'
for place in res:
    place = list(place)
    for i in range(len(place)):
        if isinstance(place[i], str):
            place[i] = place[i].replace(s1, s2)
    if (place[5] != None):
        place[5] = float(place[5])
    else:
        place[5] = 'null'
    if (place[6] != None):
        place[6] = float(place[6])
    else:
        place[6] = 'null'
    js_code += f'"{place[0]}":  new Place("{place[0]}", "{place[1]}", "{place[2]}", "{place[3]}", "{place[4]}", {place[5]}, {place[6]}, Place_Type.Settlement, "{place[7]}"),\n'
js_code += '}'
js_code = js_code.replace('"None"', "null")

f = open("JavaScripts/data/settlements.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote settlements.js")


# add MENTIONS table to .json file
res = cur.execute("SELECT DISTINCT MENTIONS.* FROM MENTIONS WHERE MENTIONS.mention_status == 'finished' AND MENTIONS.record_id != '6' AND MENTIONS.record_id < 10000").fetchall()
res_dict = {}
for mention in res:
    if mention[1] not in res_dict:
        res_dict[mention[1]] = []
    mention = list(mention)
    mention.append(0)
    res_dict[mention[1]].append(mention)
    

# add MENTIONS table to .json file
res = cur.execute("SELECT DISTINCT MEDIEVAL_MENTIONS.* from MEDIEVAL_MENTIONS").fetchall()
for mention in res:
    if mention[1] not in res_dict:
        res_dict[mention[1]] = []
    mention = list(mention)
    mention.append(1)
    res_dict[mention[1]].append(mention)
for place_id in res_dict:
    res_dict[place_id].sort(key=lambda x: x[0])

# all TODO mentions that should happen by 1968 should stop there
# for place_id in res_dict:
#     if 23 in res_dict[place_id]:
#         maxYear = 0
#         for record_id in res_dict[place_id]:
#             if record_id == 23:
#                 continue
#             if res_dict[place_id][record_id][12] > maxYear:
#                 maxYear = res_dict[place_id][record_id][12]
        
#         if maxYear < 1859:
#             aux = list(res_dict[place_id][23])
#             aux[12] = 1859
#             res_dict[place_id][23] = tuple(aux)
#         elif maxYear < 1931:
#             aux = list(res_dict[place_id][23])
#             aux[12] = 1931
#             res_dict[place_id][23] = tuple(aux)
#         elif maxYear < 1968:
#             aux = list(res_dict[place_id][23])
#             aux[12] = 1968
#             res_dict[place_id][23] = tuple(aux)

js_code = 'const MENTIONS = {'
for place_id in res_dict:
    js_code += f'"{place_id}":'
    js_code += '['
    for mention in res_dict[place_id]:
        for i in range(len(mention)):
            if isinstance(mention[i], str):
                mention[i] = mention[i].replace(s1, s2)
        if (mention[6] != None):
            mention[6] = float(mention[6])
        else:
            mention[6] = 'null'
        if (mention[7] != None):
            mention[7] = float(mention[7])
        else:
            mention[7] = 'null'
        if mention[-1] == 0:
            js_code += f'new ModernMention("{mention[0]}", "{int(mention[1])}", "{mention[2]}", "{mention[3]}", "{mention[4]}", "{mention[5]}", {mention[6]}, {mention[7]}, "{mention[8]}", "{mention[9]}", "{mention[10]}"),\n'
        else:
            js_code += f'new MedievalMention("_{mention[0]}", "{int(mention[1])}", "{mention[2]}", "{mention[4]}", "{mention[5]}", {mention[6]}, {mention[7]}, "{mention[8]}", "{mention[9]}", "{mention[10]}"),\n'

    js_code += '],\n'


js_code += '}'
js_code = js_code.replace('"None"', "null")

f = open("JavaScripts/data/settlements_mentions.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote settlements_mentions.js")

# add MONASTERIES table to .json file
res = cur.execute("SELECT DISTINCT MONASTERIES.* FROM MONASTERIES").fetchall()
js_code = '';
for place in res:
    place = list(place)
    place[0] = '_' + str(place[0])
    for i in range(len(place)):
        if isinstance(place[i], str):
            place[i] = place[i].replace(s1, s2)
    if (place[5] != None):
        place[5] = float(place[5])
    else:
        place[5] = 'null'
    if (place[6] != None):
        place[6] = float(place[6])
    else:
        place[6] = 'null'
    js_code += f'SETTLEMENTS["{place[0]}"] = new Place("{place[0]}", "{place[1]}", "{place[2]}", "{place[3]}", "{place[4]}", {place[5]}, {place[6]}, Place_Type.Monastery, "{place[7]}");\n';
js_code = js_code.replace('"None"', "null")

f = open("JavaScripts/data/monasteries.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote monasteries.js")

# add MENTIONS_MONASTERIES table to .json file
res = cur.execute("SELECT MENTIONS_MONASTERIES.*, RECORDS.year, 1 from MENTIONS_MONASTERIES, RECORDS where RECORDS.id == MENTIONS_MONASTERIES.record_id AND MENTIONS_MONASTERIES.mention_status == 'finished'").fetchall()
res_dict = {}
for mention in res:
    mention = list(mention)
    mention[1] = "_" + str(mention[1])
    if mention[1] not in res_dict:
        res_dict[mention[1]] = []
    mention.append(0)
    res_dict[mention[1]].append(mention)


res = cur.execute("SELECT DISTINCT MEDIEVAL_MENTIONS_MONASTERIES.* from MEDIEVAL_MENTIONS_MONASTERIES").fetchall()
for mention in res:
    mention = list(mention)
    mention[1] = "_" + str(mention[1])
    if mention[1] not in res_dict:
        res_dict[mention[1]] = []
    mention.append(1)
    res_dict[mention[1]].append(mention)

# all TODO mentions that should happen by 1968 should stop there
# for place_id in res_dict:
#     if 23 in res_dict[place_id]:
#         maxYear = 0
#         for record_id in res_dict[place_id]:
#             if record_id == 23:
#                 continue
#             if res_dict[place_id][record_id][12] > maxYear:
#                 maxYear = res_dict[place_id][record_id][12]
#         if maxYear < 1931:
#             aux = list(res_dict[place_id][23])
#             aux[12] = 1931
#             res_dict[place_id][23] = tuple(aux)
#         elif maxYear < 1968:
#             aux = list(res_dict[place_id][23])
#             aux[12] = 1968
#             res_dict[place_id][23] = tuple(aux)

js_code = ""
for place_id in res_dict:
    js_code += f'MENTIONS["{place_id}"] = [];\n'
    for mention in res_dict[place_id]:
        for i in range(len(mention)):
            if isinstance(mention[i], str):
                mention[i] = mention[i].replace(s1, s2)
        if (mention[6] != None):
            mention[6] = float(mention[6])
        else:
            mention[6] = 'null'
        if (mention[7] != None):
            mention[7] = float(mention[7])
        else:
            mention[7] = 'null'
        if mention[-1] == 0:
            js_code += f'MENTIONS["{place_id}"].push(new ModernMention("{mention[0]}", "{mention[1]}", "{mention[2]}", "{mention[3]}", "{mention[4]}", "{mention[5]}", {mention[6]}, {mention[7]}, "{mention[8]}", "{mention[9]}", "{mention[10]}"));\n'
        else:
            js_code += f'MENTIONS["{place_id}"].push(new MedievalMention("_{mention[0]}", "{mention[1]}", "{mention[2]}", "{mention[4]}", "{mention[5]}", {mention[6]}, {mention[7]}, "{mention[8]}", "{mention[9]}", "{mention[10]}"));\n'

js_code = js_code.replace('"None"', "null")


f = open("JavaScripts/data/monasteries_mentions.js", 'w', encoding="utf-8")
f.write(js_code)
f.close()

print("Wrote monasteries_mentions.js")
# res = cur.execute("SELECT DISTINCT place_county FROM MENTIONS WHERE MENTIONS.mention_status == 'finished'").fetchall()
# res_dict = {}
# for county in res:
#     res_dict[county[0]] = ''
# print(res_dict)

con.close()