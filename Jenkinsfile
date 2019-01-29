livefyre('''
  test:
    image:
      label: corpjenkins/node
    git: true
    commands:
      - make clean
      - make
      - make jenkins_test
      - make storybook
    xunitResults:
      - test-results.xml
    coberturaResults:
      - cobertura-coverage.xml
    publishHTML:
      dist/storybook: index.html
  deploy:
    git: true
    commands:
      - make build
    npm:
      versionBump: true
      registry: https://artifactory.corp.adobe.com:443/artifactory/api/npm/npm-react-release/
''')

properties([parameters([choice(choices: 'noop\nmajor\nminor\npatch\npreminor\nprerelease\npublish only', description: 'Bump npm version', name: 'versionBump')])])
