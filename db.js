"use strict"

const { spawn } = require('child_process')

const dbHelper = {

  _proc: null,

  _instance: {},

  start() {
    console.log('Starting database...\n')
    this._proc = spawn('docker', ['run', `-v ${process.cwd()}/dynamodb_local_db`, '-p', '3001:8000', 'cnadiminti/dynamodb-local'])
    this._proc.stdout.on('data', (data) => console.log(`${data}`));
    this._proc.stderr.on('data', (data) => console.log(`${data}`));
    return this;
  },

  add(instance) {
    this._instance = {...instance, ...this._instance}
    return this;
  },

  init(done) {
    const host = process.env.DB_HOST || 'http://localhost';
    const port = process.env.DB_PORT || 3001;

    const _done = [];
    Object.keys(this._instance).forEach(key => {
      _done[key] = false;
    })

    Object.keys(this._instance).forEach(key => {
      this._instance[key].use({host,port}).init(() => _complete(key));
    })

    function _complete(key) {
      _done[key] = true;
      const _cmplt = true;
      Object.keys(_done).forEach(k => {
        if (!_done[k]) _cmplt = false;
      })
      if (_cmplt) done()
    }
    return this;
  },

  close() {
    console.log('\nClosing database...\n')
    this._proc.kill();
    return this;
  },

  getInstance(name) {
    return this._instance[name]
  }

}

module.exports = dbHelper;