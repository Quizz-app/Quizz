export const msToTime = (duration) => {
    let minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = Math.floor(duration / (1000 * 60 * 60 * 24));

    days = (days < 10) ? "0" + days : days;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;


    return days + "d " + hours + "h " + minutes + "m "
}


export const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}


export const timeRanges = [
    {
        value: "5",
        label: "5m",
    },
    {
        value: "10",
        label: "10m",
    },
    {
        value: "15",
        label: "15m",
    },
    {
        value: "20",
        label: "20m",
    },
    {
        value: "25",
        label: "25m",
    },
    {
        value: "30",
        label: "30m",
    },
    {
        value: "40",
        label: "40m",
    },
    {
        value: "50",
        label: "50m",
    },
];