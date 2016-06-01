export COBERTURA_FILE="./coverage/cobertura-coverage.xml"

npm install

mkdir -p badges

# Check NPM dependencies status
outdated=$(npm outdated)

if echo "$outdated" | grep "Wanted"; then
  echo "Packages need to be updated."
  curl https://img.shields.io/badge/dependencies-out%20of%20date-red.svg -o badges/dependencies.svg
  echo "$outdated" > badges/dependencies.txt
else
  echo "Generating badge for dependencies up to date."
  curl https://img.shields.io/badge/dependencies-up%20to%20date-green.svg -o badges/dependencies.svg
  echo "All the dependencies are up to date." > badges/dependencies.txt
fi

npm run test:xml
npm run coverage

if ! [ -f ${COBERTURA_FILE} ]; then
  echo "ERROR: No cobertura coverage results found!"
fi

if [ -f ${COBERTURA_FILE} ] && [ -f "./node_modules/.bin/istanbul-cobertura-badger" ]; then
  ./node_modules/.bin/istanbul-cobertura-badger -e 75 -g 60 -r coverage/cobertura.xml -d badges -b coverage -v
fi
