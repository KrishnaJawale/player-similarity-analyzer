import { createTheme } from '@mui/material/styles'

const theme = createTheme ({
    palette: {
        mode: "dark",
        background: {
            default: "#121212"
        },
        primary: {
            main: "#1db954"
        },
        secondary: {
            main: "#00a86b"
        },
        text: {
            primary: "#ffffff",
            secondary: "#a1b0a5",
        },
    }
})

export default theme