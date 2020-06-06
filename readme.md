# nowdev

Fast and simple web server for prototyping anything.  
Reloads changes automatically for API routes and static.

Inspired by the old (more complicated) `now dev` by Vercel.

## Installation

```bash
mkdir -p ~/bin
git clone https://github.com/bryanjhv/nowdev.git ~/.nowdev
cd ~/.nowdev
npm install
ln -s ~/.nowdev/server.js ~/bin/nowdev
```

## Usage

Simply run `nowdev` in a folder.  
But... keep in mind the following:

- Simple file server:  
  Make sure there is no `api` folder.  
  Make sure there is no `public` folder.

- Simple Node.js API:  
  Keep your endpoints in `api` folder.  
  Files like `[id].js` allow param passing.  
  Export an Express handler (`req`and `res`).

- Mixing of previous:  
  Put your static files in `public` folder.

You can use whatever you want in API.  
Use `export default` if you like that way.  
Or maybe `async await` makes you happier.  
And the old ones will prefer `module.exports`...  
Just keep doing your stuff and that's it, so simple!

## Example

Given this tree:

```tree
.
|- api
|  |- index.js
|  |- users
|  |  `- [id].js
|  `- users.js
`- public
   `- index.html
```

Generated routes are:

```text
/               # public
/api            # api/index.js
/api/users      # api/users.js
/api/users/:id  # api/users/[id].js
```

## More features

For now it fits my use case, but you can contribute.  
Anything accepted as long as it's kept simple/minimal.

## License

This project is released under the [AGPLv3 license](license.txt).
