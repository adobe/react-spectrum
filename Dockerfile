FROM nodesource/centos7:4.4.2

MAINTAINER MCDP Team

RUN yum -y install git && \
	npm cache clean -f

CMD npm config set registry http://registry.npmjs.org/

# Move react-coral code
COPY	. /react-coral

WORKDIR /react-coral

ENV NODE_ENV development
