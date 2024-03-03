SELECT  m1.id, m1.name
FROM PLACES m1
WHERE m1.id > 13643 AND NOT EXISTS (SELECT 1 FROM mentions where mentions.place_id=m1.id AND mentions.place_status != "active" AND mentions.place_status != "founded");