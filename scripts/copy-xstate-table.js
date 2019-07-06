var fs = require("fs-extra");

function copy(destination) {
  fs.copy('./xstate-table', `./${destination}-table/node_modules/xstate-table`, function (err) {
    if (err) return console.error(err)
    console.log(`✔ ${destination} copied`)
  });
}

copy('angular')
copy('react')
copy('svelte')
copy('vue')

// make it myself easy here, don't want to extend the svelte builder to include the css needed for this demo
// just copy xstate-table to the public folder 🤷‍♂️
fs.copy('./xstate-table/', `./svelte-table/public/`, function (err) {
  if (err) return console.error(err)
  console.log(`✔ xstate-table/index.css copied`)
});