import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

export const colors = {
    base: '#F6D776',
    secondary: '#EEEEEE',
    tertiary: '#647D87',
    accent: '#76ABAE',
}


export const theme = createTheme({
    typography: {
        fontFamily: 'Lato'
    },
    palette: {
        primary: {
            main: colors.base,
        },
        secondary: {
            main: colors.secondary,
        },
        tertiary: {
            main: colors.tertiary
        },
        text: {
            tertiary: colors.tertiary
        }
        
    },
});
