const slider = document.getElementById("yearRange");
const yearOutput = document.getElementById("yearContainer");

const Mention = {
    Place_Id: 0,
    Record_Id: 1,
    Name: 2,
    Commune: 3,
    County: 4,
    Country: 5,
    Latitude: 6,
    Longitude: 7,
    Place_Status: 8,
    Notes: 9,
    Reasoning: 10,
    Mention_Status: 11,
    Year: 12,
    Place_Type: 13,
    No_Mentions: 14,
};

const Place = {
    Id: 0,
    Name: 1,
    Commune: 2,
    County: 3,
    Country: 4,
    Latitude: 5,
    Longitude: 6,
};

const Record = {
    Id: 0,
    Year: 1,
    Description: 2,
};

const Place_Type = {
    Settlement: 0,
    Monastery: 1,
};
