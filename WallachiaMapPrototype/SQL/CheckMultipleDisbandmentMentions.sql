SELECT place_id
FROM MENTIONS
WHERE place_status = 'disbanded' OR place_status = 'united' OR place_status = 'unknown'
GROUP BY place_id
HAVING COUNT(*) > 1;