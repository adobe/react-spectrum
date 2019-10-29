livefyre('''
  test:
    image:
      label: corpjenkins/node8
    git: true
    commands:
      - make clean_node_modules
      - make install_no_postinstall
      - make clean
      - make -B
      - make jenkins_test
      - make storybook
    xunitResults:
      - test-results.xml
    coberturaResults:
      - cobertura-coverage.xml
    publishHTML:
      public/storybook: index.html
      public/storybook3: index.html
  deploy:
    branch: "^(next)$"
    git: true
    sshAgent: rspbot
    commands:
      - git reset --hard
      - git checkout next
      - git reset --hard origin/next
      - make ci
    timeout: 30
''')

properties([parameters([choice(choices: 'noop\nmajor\nminor\npatch\npreminor\nprerelease\npublish only\nwebsite only', description: 'Bump npm version', name: 'VERSION')])])
