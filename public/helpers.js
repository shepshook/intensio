export function getFormData(formId) {
    let formData = {};
    Array.from(document.getElementById(formId).elements)
        .filter(item => item.tagName === "INPUT")
        .forEach(input => formData[input.name] = input.value);

    return formData;
}

export function formatRecordsTime(records) {
    if (!records)
        return "00:00:00";

    const s = Math.floor(Object.values(records)
        .map((r) => (r.to == null
            ? new Date()
            : Date.parse(r.to)) - Date.parse(r.from))
        .reduce((a, b) => a + b, 0) / 1000);

    return formatSeconds(s);
}

export function formatMillis(millis) {
    return formatSeconds(Math.floor(millis / 1000));
}

function formatSeconds(s) {
    const hh = Math.floor(s / 3600);
    const mm = Math.floor(s % 3600 / 60);
    const ss = s % 60;
    
    // add zeros if the value takes less than 2 chars
    const f = (x) => x.toString().padStart(2, 0);
    
    return `${f(hh)}:${f(mm)}:${f(ss)}`;
}