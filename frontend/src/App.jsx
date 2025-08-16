import React, { useState } from 'react'
import { Box, Typography, TextField, Stack, Button, List, ListItem, ListItemText, Grid,
    FormControl, FormControlLabel, InputLabel, Select, MenuItem, Chip, OutlinedInput, Checkbox
} from '@mui/material';
import { RadarChart } from '@mui/x-charts/RadarChart';

function App() {
    //player search
    const [playerSearch, setPlayerSearch] = useState("")
    const [similarPlayers, setSimilarPlayers] = useState([]);

    //machine learing/data features settings
    const [PCA, setPCA] = useState(false);
    const [minAge, setMinAge] = useState();
    const [maxAge, setMaxAge] = useState();
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const comparisonMetrics = [
        "Defensive",
        "Passing",
        "Possession",
        "Take Ons",
        "Ball Carrying and Receiving",
        "Goals and Shot Creation",
        "Shooting"
    ]

    //player comprison radar/spider chart
    const [statKeys, setStatKeys] = useState([]);
    const [radarData, setRadarData] = useState(null);

    const handleSearch = async () => {
        try {
            const params = new URLSearchParams();
            params.append("player", playerSearch);

            const res = await fetch (`http://localhost:8000/similar_players?${params.toString()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    selectedMetrics,
                    minAge: minAge ? minAge : 0,
                    maxAge: maxAge ? maxAge : 50,
                    PCA: PCA
                })
            });

            const data = await res.json();
            console.log(data);

            //radar features
            const statKeys = Object.keys(data[0]).filter(key => key !== "Player" && key !== "Squad" && key !== "Age");
            
            console.log(statKeys);
            setStatKeys(statKeys);

            //set the radar data to only the first player in the array (the player the user searched)
            setRadarData([data[0]].map((player) => ({
                player: player.Player,
                stats: statKeys.map((stat) => player[stat])
            })));

            //remove first player from array (which is the player we searched for)
            data.shift()
            setSimilarPlayers(data)
        } catch (e) {
            console.log("Error: ", e);
        }
    }

    const handleChangeMetrics = (e) => {
        const {
            target: { value }
        } = e;
        setSelectedMetrics(typeof value === "string" ? value.split(",") : value);
        console.log(selectedMetrics);
    }

    return (
        <Stack sx={{mt:6}} spacing={3}>
            <Box sx={{display: "flex", justifyContent: "center"}}>
                <Typography variant="h3">Player Similarity Analysis</Typography>
            </Box>
            <Grid container spacing={4} sx={{display: "flex", justifyContent: "center"}}>
                <TextField
                    label="Player Name"
                    variant="standard"
                    value={playerSearch}
                    onChange={(e) => {
                        setPlayerSearch(e.target.value)
                    }}
                >
                </TextField>
                <FormControl sx={{ m: 1, width: 400 }}>
                    <InputLabel>Comparison Metrics</InputLabel>
                    <Select
                        multiple
                        onChange={handleChangeMetrics}
                        input={
                            <OutlinedInput label="Comparison Metrics"/>
                        }
                        value={selectedMetrics}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                        //MenuProps={MenuProps}
                    >
                        {comparisonMetrics.map((field) => (
                            <MenuItem
                                key={field}
                                value={field}
                            >
                                {field}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid container spacing={2} sx={{display: "flex", justifyContent: "center"}}>
                <TextField
                    label="Age (Min)"
                    variant="standard"
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(parseInt(e.target.value))}
                ></TextField>
                <TextField
                    label="Age (Max)"
                    variant="standard"
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(parseInt(e.target.value))}
                ></TextField>
                <FormControlLabel control={
                        <Checkbox value={PCA} onChange={(e) => setPCA(e.target.checked)}/>
                    } label="PCA Reduction" />
            </Grid>
            <Box sx={{display: "flex", justifyContent: "center"}}>
                <Button variant="contained" size='lg' onClick={handleSearch}>Scout</Button>
            </Box>
            <Grid container spacing={10} alignItems="center" justifyContent="center">
                <Grid size={4}>
                    <List>
                        {similarPlayers.map((player, index) => (
                            <ListItem
                                key={index}
                                divider
                                dense
                                secondaryAction={
                                    <Checkbox
                                        edge="end"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                //setRadarData((prev) => [...prev, player])
                                                const playerRadar = [player].map(player => ({
                                                    player: player.Player,
                                                    stats: statKeys.map(stat => player[stat])
                                                }));

                                                console.log(radarData);
                                                console.log(playerRadar);

                                                setRadarData(radarData.concat(playerRadar));
                                            } else {
                                                console.log(player);
                                                setRadarData((prev) => prev.filter((p) => p.player != player.Player));
                                            }
                                        }}
                                    />
                                }
                            >
                                <ListItemText
                                    primary={player.Player}
                                    secondary={`Age: ${player.Age}, Club: ${player.Squad}`}>
                                </ListItemText>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid size={4}>
                    {radarData && (
                        <RadarChart
                            data={radarData}
                            series={radarData.map(player => ({
                                label: player.player,
                                data: player.stats
                            }))}
                            radar={{
                                metrics: statKeys
                            }}
                            height={500}
                            grid={{ radialLines: true }}
                            legend={{ position: { vertical: 'bottom', horizontal: 'middle' } }}
                            tooltip={{ trigger: 'item' }}
                        >
                        </RadarChart>
                    )}
                </Grid>
            </Grid>
        </Stack>
    )
}

export default App
