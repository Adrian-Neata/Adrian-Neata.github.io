SELECT place_id
FROM MENTIONS
WHERE place_status = 'disbanded'
GROUP BY place_id
HAVING COUNT(*) > 1;
