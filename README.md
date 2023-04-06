<div style="text-align: center;" align="center">

# grace-recognition

A composition api for SpeechSynthesis

[![NPM version][npm-image]][npm-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![License][license-image]][license-url]

[![Sonar][sonar-image]][sonar-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

## **For API documentation, see: [API Docs](./docs/modules.md)**

</div>

## Installing

```bash
# use pnpm
$ pnpm install grace-recognition

# use npm
$ npm install grace-recognition --save

# use yarn
$ yarn add grace-recognition
```

## Usage

1. Simple use:

```ts
import Recognition from 'grace-recognition'

const Recognition = new Recognition()

Recognition.speak('very good')
Recognition.speak('powered by saqqdy<https://github.com/saqqdy>')
```

2. Using unpkg CDN:

```html
<!-- for modern browser -->
<head>
  <script src="https://unpkg.com/grace-recognition/dist/index.min.js"></script>
</head>

<!-- for ie11 and blow -->
<head>
  <script src="https://unpkg.com/grace-recognition/dist/es5/index.min.js"></script>
</head>
```

## Support & Issues

Please open an issue [here](https://github.com/saqqdy/grace-recognition/issues).

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/grace-recognition.svg?style=flat-square
[npm-url]: https://npmjs.org/package/grace-recognition
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/grace-recognition/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/grace-recognition&utm_campaign=Badge_Grade
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/grace-recognition.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/grace-recognition?branch=master
[download-image]: https://img.shields.io/npm/dm/grace-recognition.svg?style=flat-square
[download-url]: https://npmjs.org/package/grace-recognition
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_grace-recognition
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_grace-recognition
