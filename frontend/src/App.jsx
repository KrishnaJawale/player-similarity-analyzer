import React, { useState } from 'react'
import { Box, Typography, TextField, Stack, Button, List, ListItem, ListItemText, Grid,
    FormControl, FormControlLabel, InputLabel, Select, MenuItem, Chip, OutlinedInput, Checkbox, Slider
} from '@mui/material';
import { RadarChart } from '@mui/x-charts/RadarChart';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
    //player search
    const [playerSearch, setPlayerSearch] = useState("")
    const [similarPlayers, setSimilarPlayers] = useState([]);

    //machine learing/data features settings
    const [PCA, setPCA] = useState(false);
    const [minAge, setMinAge] = useState();
    const [maxAge, setMaxAge] = useState();
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [metricWeights, setMetricWeights] = useState({});
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

            const res = await fetch (`${API_URL}?${params.toString()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    selectedMetrics: selectedMetrics,
                    metricWeights: metricWeights,
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
        const newSelected = e.target.value;
        console.log(newSelected);
        setSelectedMetrics(newSelected);

        //If a new metric has been selected, add it to metric weights object, default weight to 1 (max)
        const newWeights = {...metricWeights};
        newSelected.forEach((metric) => {
            if (!(metric in newWeights)) {
                newWeights[metric] = 1;
            }
        });

        //If a metric has been deselected, remove it from metric weights object
        Object.keys(newWeights).forEach((metric) => {
            if (!newSelected.includes(metric)) {
                delete newWeights[metric];
            }
        })

        setMetricWeights(newWeights);
    }

    const handleChangeWeights = (change) => (e, newWeight) => {
        setMetricWeights((prev) => ({...prev, [change]: newWeight}));
        console.log(metricWeights);
    }

    return (
        <Stack sx={{mt:10, mb:6}} spacing={3}>
            <Stack sx={{display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5}}>
                <Typography variant="subtitle1" sx={{width: 600, color: "#ffc107"}}>Krishna Jawale</Typography>
                <Typography variant="subtitle1" sx={{width: 600, color: "#1db954"}}>Soccer Playstyle Scout 24/25</Typography>
                <Typography variant="subtitle1" sx={{width: 600}}>A tool that takes in a player name, selected playstyle metrics and custom weights, then uses machine learning to compute and return the 10 most similar players based on the selected parameters. Uses player data from the top 5 leagues during the 24/25 season.</Typography>
            </Stack>
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
            </Grid>
            <Grid container spacing={4} sx={{display: "flex", justifyContent: "center"}}>
                <FormControl sx={{ m: 1, width: 500 }}>
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
                                    <>
                                        <Chip color="success" variant="outlined" key={value} label={value} />
                                        <Slider
                                            size="small"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            value={metricWeights[value]}
                                            onChange={handleChangeWeights(value)}
                                        />
                                    </>
                                ))}
                            </Box>
                        )}
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
            </Grid>
            <Grid container spacing={2} sx={{display: "flex", justifyContent: "center"}}>
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
