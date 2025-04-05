const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run-ps', (req: { body: { command: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): any; new(): any; }; }; json: (arg0: { output: any; }) => void; }) => {
    const { command } = req.body;
    exec(`powershell.exe -Command "${command}"`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            return res.status(500).json({ error: stderr });
        }
        res.json({ output: stdout });
    });
});

app.listen(3000, () => console.log('Local PowerShell bridge running on http://localhost:3000'));