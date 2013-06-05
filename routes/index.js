var conf = require('../conf');

var _getCommonViewData = function() {
    return {
        domain: conf.domain,
        port: conf.port,
        picId: false,
        mac: process.platform == 'darwin'
    };
};

exports.index = function(req, res) {
    var viewData = _getCommonViewData();
    viewData.imageSrc = false;
    res.render('index.html', viewData)
};

exports.uploadHandler = function(req, res) {
    var image = req.files.image
    
    if (!image) {
        res.send({res: false});
        return false;    
    }
    
    var fs = require('fs'),
        path = require('path'),
        im = require('imagemagick');

    fs.readFile(image.path, function (err, data) {
        // asynchronously reads the entire contents of an image file
        var uploadDir = path.join(__dirname, '../', '/public/uploads/'),
            previewDir = uploadDir + 'previews/';
        
        var picId = req.param('picId');
        if(!picId) {
           picId = new Date().getTime(); 
        }
        
        var savePath = uploadDir + picId + '_original.png';
        
        fs.writeFile(savePath, data, function(err) {});
        var base64Image = original_data.toString('base64');
        var decodedImage = new Buffer(base64Image, 'base64');
        fs.writeFile(uploadDir + picId + '_decoded.png', decodedImage, function(err) {
            if (err) throw err;
            
            // make a preview of uploaded picture        
            var prevParams = {  
                srcPath: savePath,
                srcFormat: 'png',
                dstPath: previewDir + 'pr' + picId + '.png',
                format: 'png',
                width: 200
            };
            
            im.resize(prevParams, function(err, stdout, stderr){
                if (err) throw err;
            });
            
            var response = {
                picId: picId,
                picLink: conf.domain + '/uploads/' + picId + '.png'
            };
            
            im.identify(savePath, function(err, features){
              if (err) throw err;
              // { format: '', width: int, height: int, depth: int}
              response.picParams = {
                  format: features.format,
                  width: features.width,
                  height: features.height,
                  filesize: features.filesize
              };
              res.send(response);
            });

        }); 
    });
};

exports.imageHandler = function(req, res) {
    var viewData = _getCommonViewData();
    var picId = req.route.params.picId;
    viewData.imageSrc = 'uploads/' + picId + '.png';
    viewData.picId = picId;
    viewData.picLink = conf.domain + viewData.imageSrc;
    res.render('index.html', viewData);
};

/* Route to monitor uploaded pictures */
exports.monitorHandler = function(req, res) {
    var fs = require('fs'),
        path = require('path');
        
    var viewData = _getCommonViewData(), 
        filesDir = path.join(__dirname, '../', '/public/uploads/previews/');
            
    fs.readdir(filesDir, function(err, files){
        viewData.files = files;
        viewData.filesCount = files.length;
        res.render('monitor.html', viewData);
    });
}



