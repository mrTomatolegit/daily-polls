import fs from 'fs';

export function readCSV<T extends Record<string, string>>(filePath: string, defaultHeaders: string): T[] {
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultHeaders);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = data.split('\n').map(line => line.split('#')[0].split(','));
    const headers = parsed.shift();
    if (!headers) return [];
    const returnValue = parsed.map((line, i) => {
        if (line.length !== headers.length) return console.warn(`Line (${i}) with an invalid length`, line);
        const obj = {} as T;
        headers.forEach((header, i) => {
            (obj as any)[header] = line[i];
        });
        return obj;
    }).filter(obj => obj) as T[];
    return returnValue;
}

export function createCSVRow<T extends Record<string, string>>(data: T, headers: string): string {
    return headers.split(',').map(header => data[header] || '').join(',');
}

export function appendCSVRow<T extends Record<string, string>>(filePath: string, data: T, headers: string) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, headers);
    }
    fs.appendFileSync(filePath, '\n' + createCSVRow(data, headers));
};

export function updateCSVRow<T extends Record<string, string>>(filePath: string, data: T, headers: string) {
    const rows = readCSV<T>(filePath, headers);
    const index = rows.findIndex(row => row.id === data.id);
    if (index === -1) return;
    rows[index] = data;
    fs.writeFileSync(filePath, headers + '\n' + rows.map(row => createCSVRow(row, headers)).join('\n'));
}

export function deleteCSVRow<T extends Record<string, string>>(filePath: string, id: string, headers: string) {
    const rows = readCSV<T>(filePath, headers);
    const index = rows.findIndex(row => row.id === id);
    if (index === -1) return;
    rows.splice(index, 1);
    fs.writeFileSync(filePath, headers + '\n' + rows.map(row => createCSVRow(row, headers)).join('\n'));
}
