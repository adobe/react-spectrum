livefyre('''
  test:
    image:
      label: corpjenkins/node8
    git: true
    commands:
      - make clean_all
      - make
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
    branch: "^(master)$"
    git: true
    sshAgent: rspbot
    commands:
      - git reset --hard
      - git checkout master
      - git reset --hard origin/master
      - make ci
''')

properties([parameters([choice(choices: 'noop\nmajor\nminor\npatch\npreminor\nprerelease\npublish only\nwebsite only', description: 'Bump npm version', name: 'VERSION')])])
