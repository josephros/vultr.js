# vultr.js

This node.js is a simple and complete port of the [vultr api](https://www.vultr.com/api/) in node.js.

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
