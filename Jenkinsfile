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
    branch: "^(master)$"
    git: true
    commands:
      - make build
    npm:
      versionBump: true
      registry: https://artifactory.corp.adobe.com:443/artifactory/api/npm/npm-react-release/
''')

// Release to livefyre npm if publishing
if (params.versionBump && params.versionBump != "noop") {
  livefyre('''
    deploy:
      branch: "^(master)$"
      git: true
      image:
        label: corpjenkins/node
      commands:
        - git checkout master
        - git reset --hard origin/master
        - make storybook
        - make unprefix
      npm:
        versionBump: false
        registry: https://maven.livefyre.com/content/repositories/lfnpm/
      lfcdn:
        env: prod
  ''')
}

properties([parameters([choice(choices: 'noop\nmajor\nminor\npatch\npreminor\nprerelease\npublish only', description: 'Bump npm version', name: 'versionBump')])])
