Example of registration using JSON POST 
curl -d '{"username":"Michel", "password":"pleaseDontHack","mail":"Michael@ProHacker.pl"}' -H "Content-Type: application/json" -X POST http://localhost:5000/api/register

Show registered users list (Resturns JSON)
curl --get localhost:5000/api/list
