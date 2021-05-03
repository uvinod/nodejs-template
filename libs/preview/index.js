const fs = use('fs')
const path = use('path')
const UrlPattern = use('url-pattern')
class BuildPreview {
  static build({request, response} = {}){
    let params = request.params
    let content = fs.readFileSync(path.join(__dirname, '/preview.html'), 'utf8');
    let keys = Object.keys(previewConfig)
    let data
    for(let key of keys){
      let pattern = new UrlPattern(key);
      if(pattern.match(params[0])){
        data = previewConfig[key];
        break;
      }
    }
    if(!data) data = previewConfig['__DEFAULT__']
    eval(`content=\`${content}\``)
    response.send(content)
  }
}

module.exports = BuildPreview;
