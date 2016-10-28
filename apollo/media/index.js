const cloudinary = require('cloudinary');
const lodash = require('lodash');

const transform = image => {
  const newImage = {};
  Object.keys(image).forEach(key => {
    if (key === 'public_id') {
      newImage.id = image.public_id;
      return;
    } else if (key === 'secureUrl') {
      return;
    } else if (key === 'url') {
      newImage.url = image.secureUrl || image.url;
      return;
    } else if (key === 'colors') {
      return;
    } else if (key === 'predominant') {
      newImage['colors'] = image.predominant.google.map(x => x[0]);
      return;
    } newImage[lodash.camelCase(key)] = image[key];
  });
  return newImage;
}
const transformSignature = ({ signature, api_key, timestamp }) => ({
  url: 'https://api.cloudinary.com/v1_1/djyenzorc/auto/upload',
  signature,
  timestamp,
  apiKey: api_key
});
const getImages = (config) => {
  return new Promise((yay, nay) => {
    return cloudinary.api.resources((result) => {
      yay(result.resources.map(transform));
    }, Object.assign({}, config, {
      tags: true,
      type: 'upload',
      colors: true,
      //prefix: ''
    }))
  });
}
const getImageById = (config, id) => {
  return new Promise((yay, nay) => {
    return cloudinary.api.resource(
      id,
      (result) => {
        yay(transform(result));
      }, Object.assign({}, config, {
        type: 'upload',
        colors: true,
        //prefix: ''
    }));
  });
}
const getSignedRequest = (config) => {
  return new Promise((yay, nay) => {
    return yay(transformSignature(cloudinary.utils.sign_request({
      timestamp: Math.round(new Date().getTime()/1000),
    }, config)));
  });
}

module.exports = (schema, { adapter, uri } = {}) => {
  let config = {};
  if (uri) {
    const split1 = uri.split('@');
    const split2 = split1[0].split('://');
    const split3 = split2[1].split(':');
    config.cloud_name = split1[1];
    config.api_key = split3[0];
    config.api_secret = split3[1];
  }

  schema.addSchema({
    name: 'file',
    adapter,
    query: `
      file(id: String): file
      fileList: [file]
      cloudinaryRequest: cloudinaryRequest
    `,
    mutation: `
      file(id: String, payload: fileInput, operationType: OPERATION_TYPE): file
    `,
    resolvers: {
      Query: {
        file: (source, args, x, { fieldASTs }) => {
          return getImageById(config, args.id);
        },
        fileList: (source, args, x, { fieldASTs }) => {
          return getImages(config);
        },
        cloudinaryRequest: (source, args, x, { fieldASTs }) => {
          return getSignedRequest(config);
        }
      },
      Mutation: {
        file: (source, args, x, { fieldASTs }) => {
          const attributes = fieldASTs[0].selectionSet.selections.map(({ name }) => name.value);
          if (args.operationType && args.operationType.toLowerCase() === 'remove') {
            return adapter.remove('Files', Object.assign({}, args));
          }
          if (args.payload) {
            args = Object.assign({}, args, args.payload);
            delete args.payload;
          }
          delete args.operationType;
          return adapter.write('Files', Object.assign({}, args), { attributes });
        },
      }
    },
    typeDefs: {
      image: `
        type {
          url: String
          crop: [Int]
          width: Int
          height: Int
        }
      `,
      file: `
        type {
          id: String
          format: String
          version: Int
          resourceType: String
          type: String
          createdAt: String
          height: Int
          width: Int
          bytes: Int
          tags: [String]
          url: String
          colors: [String]
        }
      `,
      cloudinaryRequest: `
        type {
          url: String
          signature: String
          timestamp: String
          apiKey: String
        }
      `
    }
  });
};

exports.testEndpoint = (config = {}) => (req, res) => {
  res.send(`
    <form action="${config.endpoint || '/upload'}" method="post" enctype="multipart/form-data">
      <link href="http://hayageek.github.io/jQuery-Upload-File/4.0.10/uploadfile.css" rel="stylesheet">
      <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
      <script src="http://hayageek.github.io/jQuery-Upload-File/4.0.10/jquery.uploadfile.min.js"></script>
      <div id="fileuploader">Upload</div>
      <script>
        $(document).ready(function()
        {
          $.ajax({
            type: "POST",
            dataType: 'json',
            url: "/graphql",
            data: JSON.stringify({
              query: "query { cloudinaryRequest { signature, apiKey, timestamp } }",
              variables: ""
            }),
            success: function(data) {
              document.SIGNATURE = data.data.cloudinaryRequest.signature;
              document.TIMESTAMP = data.data.cloudinaryRequest.timestamp;
              document.APIKEY = data.data.cloudinaryRequest.apiKey;
            },
            contentType: "application/json"
          });
          $("#fileuploader").uploadFile({
            url: "https://api.cloudinary.com/v1_1/djyenzorc/auto/upload",
            fileName:"file",
            dynamicFormData: function(x, y) {
              var data = {};
              data.api_key = document.APIKEY;
              data.timestamp = document.TIMESTAMP;
              data.signature = document.SIGNATURE;
              return data;
            }
          });
        });
      </script>
      Datei:
      <br>
      <input type="file" name="file" value="">
      <br>
      <br>
      <input type="submit" value="Absenden">
    </form>
  `);
};
