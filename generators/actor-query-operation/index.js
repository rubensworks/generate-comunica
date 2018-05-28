var Generator = require('yeoman-generator');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
    this.argument('operationName', { type: String, required: false, optional: true });
  }

  prompting() {
    var prompts = [
    {
      name    : 'operationName',
      message : 'The SPARQL Algebra type name of the operator (lowercase)',
      default : this.options.operationName,
      validate: function(input) {
        return !/\s/g.test(input) && /^[a-z0-9-]+$/.test(input);
      }
    }, {
      name    : 'operationInterfaceType',
      message : 'The SPARQL Algebra interface name',
      default : function(props) {
        return props.operationName.replace(/(^|-)([a-z])/g, function (g) { return g[g.length - 1].toUpperCase(); });
      },
      validate: function(input) {
        return /^[a-z0-9A-Z]+$/.test(input);
      }
    }, {
      name    : 'name',
      message : 'Actor name (without actor-bus- prefix, lowercase)',
        default : function(props) {
          return props.operationName;
        },
      validate: function(input) {
        return !/^actor-/.test(input) && !/\s/g.test(input) && /^[a-z0-9-]+$/.test(input);
      }
    }, {
      name    : 'fullName',
      message : 'The full readable name of the actor',
      default : function(props) {
        var fullName = props.name.replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); });
        fullName = fullName[0].toUpperCase() + fullName.substr(1);
        fullName = fullName.replace('Rdf', 'RDF');
        return fullName;
      }
    }, {
      name    : 'componentActorName',
      message : 'The component base name of the actor (without Bus part)',
      default : function(props) {
        var fullName = props.name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        fullName = fullName[0].toUpperCase() + fullName.substr(1);
        return fullName;
      },
      validate: function(input) {
        return !/\s/g.test(input) && !/\./.test(input);
      }
    }, {
      name    : 'description',
      message : 'A description of the actor',
      default : function(props) {
        return 'A comunica ' + props.fullName + ' Query Operation Actor.';
      }
    }, {
      name    : 'prefix',
      message : 'The component context prefix',
      default : function(props) {
        return 'caqo' + props.name.split('-').map(function (part) { return part[0] }).join('');
      },
      validate: function(input) {
        return !/\s/g.test(input) && !/\./.test(input) && !/-/.test(input) && !/[A-Z]/.test(input) && input.length > 1;
      }
    }];
    var self = this;
    return this.prompt(prompts).then(function (props) {
      self.props = props;
      return props;
    });
  }

  writing() {
    var files = [
      { src: 'components/Actor/QueryOperation/NAME.jsonld', dest: 'components/Actor/QueryOperation/' + this.props.componentActorName + '.jsonld' },
      'components/components.jsonld',
      'components/context.jsonld',
      { src: 'lib/ActorQueryOperationNAME.ts', dest: 'lib/ActorQueryOperation' + this.props.componentActorName + '.ts' },
      { src: 'test/ActorQueryOperationNAME-test.ts', dest: 'test/ActorQueryOperation' + this.props.componentActorName + '-test.ts' },
      'test/tsconfig.json',
      'test/tslint.json',
      '.npmignore',
      'index.ts',
      'package.json',
      'README.md',
      'tsconfig.json',
      'tslint.json'
    ];
    var self = this;
    var basePath = this.destinationRoot().endsWith('packages') ? './' : './packages/';

    // Set versions
    const cwd = process.cwd() + '/';
    self.props['versionComunicaCore'] = require(cwd + basePath + 'core/package.json').version;
    self.props['versionBus'] = require(cwd + basePath + 'bus-query-operation/package.json').version;

    files.forEach(function(file) {
      var s = typeof file == 'string' ? file : file.src,
          d = typeof file == 'string' ? file : file.dest;
      self.fs.copyTpl(
        self.templatePath(s),
        self.destinationPath(basePath + 'actor-query-operation-' + self.props.name + '/' + d),
        self.props
      )
    });
  }
};
