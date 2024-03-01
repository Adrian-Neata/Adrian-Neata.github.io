INSERT INTO mentions (place_id, place_name, place_commune, place_county, place_country, place_latitude, place_longitude, place_status, notes, reasoning, mention_status, record_id)
SELECT m1.place_id, m1.place_name, m1.place_commune, m1.place_county, m1.place_country, m1.place_latitude, m1.place_longitude, m1.place_status, m1.notes, m1.reasoning, m1.mention_status, 113 as record_id
FROM mentions m1
WHERE record_id = 25 AND place_county=="Tecuci" AND NOT EXISTS (SELECT 1 FROM mentions where mentions.record_id=113 AND mentions.place_id=m1.place_id);