# To install required libs
```
pip install -r requirements.txt
```
# Register example
```
curl --insecure -d '{"username":"Reg_Test", "password":"pleaseDontHack","mail":"Test@test.tart"}' -H "Content-Type: application/json" -X POST https://localhost:5000/api/register
```
# Login example (returns api key)
```
curl --insecure -d '{"username":"Reg_Test", "password":"pleaseDontHack"}' -H "Content-Type: application/json" -X POST https://localhost:5000/api/login
```

# List users (require valid api key)
```
curl --insecure -d '{"API_KEY":"bde7167a7aedc024deabc5ef57d32e3b"}' -H "Content-Type: application/json" -X POST https://localhost:5000/api/list
```
# Add trace (require valid api key)
```
curl --insecure -d '{"API_KEY":"0af3ac6d4f052d8cd15943b735f64be4","TRACE":[[{"lat":"1.524"}],[{"lng":"2.145"}],[{"lat":"1.654"}],[{"lng":"2.852"}]],"DATE":"2020-04-23","DURATION":"00:00:02","DISTANCE":0.5}' -H "Content-Type: application/json" -X POST https://localhost:5000/api/saveTrace

```