# vultr.js

This is a simple and complete port of the [vultr api](https://www.vultr.com/api/) in node.js.

## Installation

```bash
npm install vultr.js
```

## Get started

Authentication with an api key 
```javascript
vultr.setToken('your token here');
```

Get all applications available
```javascript
vultr.getApplications(function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

Get account info
```javascript
vultr.getAccountInfo(function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

Get plans
```javascript
vultr.getPlans(function(err, data) {
  if (err) throw err;
  console.log(data);
});
```

Create new server named helloworld at Paris with 768 MB of ram and with Debian 8 jessie 
```javascript
vultr.createServer({DCID: 24, VPSPLANID: 29, OSID: 194, label: 'helloworld'}, function (err, data) {
  if (err) throw err;
  console.log(data);
});
```
