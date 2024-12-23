PROJECT_NAME=api-core
IMAGE=vizhub/$(PROJECT_NAME)
AWS_DEFAULT_REGION 	:= ap-southeast-1
AWS_ECR_REPO 		:= $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_DEFAULT_REGION).amazonaws.com/$(IMAGE)

ifndef AWS_ACCOUNT_ID
	AWS_ACCOUNT_ID=112038567264
	AWS_ECR_REPO=$(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_DEFAULT_REGION).amazonaws.com/$(IMAGE)
endif

ifndef IMAGE_TAG
	IMAGE_TAG=latest
endif

ifndef CI_ENVIRONMENT_SLUG
	CI_ENVIRONMENT_SLUG=demo
endif

new-module:
	@[ "${name}" ] || ( echo "name is not set, eg: make new-module name=module"; exit 1 )
	nest g mo $(name)
	nest g co $(name)
	nest g s $(name)

start_db:
	docker-compose -f .dev/docker-compose.db.yaml up -d

stop_db:
	docker-compose -f .dev/docker-compose.db.yaml down

start_centrifugo:
	docker-compose -f .dev/docker-compose.centrifugo.yaml up

stop_centrifugo:
	docker-compose -f .dev/docker-compose.centrifugo.yaml down

compose: stop_db stop_centrifugo start_db start_centrifugo

clean:
	rm -rf dist

clean_db:
	rm -rf .dev/db-data

dotenv:
	cp .env.example .env

up:
	npm run start:dev

down: stop_db

bootstrap: dotenv
	npm i

docker-build: Dockerfile
	@echo $(AWS_ACCOUNT_ID)
	@echo $(AWS_ECR_REPO)
	@echo "+\n++ Performing build of Docker image $(IMAGE)...\n+"
	@docker build -t $(IMAGE):$(IMAGE_TAG) --force-rm --rm .

docker-push:
	@echo "+\n++ Logging in to Amazon ECR $(AWS_ACCOUNT_ID) ...\n+"
	@aws ecr get-login-password --region $(AWS_DEFAULT_REGION) | docker login --username AWS --password-stdin $(AWS_ECR_REPO)
	@echo "+\n++ Pushing image $(IMAGE):$(IMAGE_TAG) to AWS ECR...\n+"
	@docker tag $(IMAGE):$(IMAGE_TAG) $(AWS_ECR_REPO):$(IMAGE_TAG)
	@docker push $(AWS_ECR_REPO):$(IMAGE_TAG)

docker: docker-build docker-push

pbcopy-env:
	@tr "\n" "," < .env | pbcopy

switch-kubernetes-context:
	kubectl config use-context arn:aws:eks:ap-southeast-1:112038567264:cluster/vh-eks-demo-eks-Ca4IfUgA

build-demo: AWS_ACCOUNT_ID=112038567264
build-demo: AWS_ECR_REPO=112038567264.dkr.ecr.$(AWS_DEFAULT_REGION).amazonaws.com/$(IMAGE)
build-demo: docker

deploy-demo: CI_ENVIRONMENT_SLUG=demo
deploy-demo: helm-upgrade
deploy-demo: k-deployment-restart

deploy: switch-kubernetes-context build-demo deploy-demo

k-deployment-restart:
	kubectl rollout restart deployment/$(PROJECT_NAME)-$(CI_ENVIRONMENT_SLUG) -n prd

helm-upgrade:
	helm2 secrets upgrade -i -f deploy/values.$(CI_ENVIRONMENT_SLUG).yaml -f deploy/secrets.$(CI_ENVIRONMENT_SLUG).yaml --namespace prd --force $(PROJECT_NAME)-$(CI_ENVIRONMENT_SLUG) deploy/ --set "global.env=$(CI_ENVIRONMENT_SLUG)" --set "image.tag=$(IMAGE_TAG)"

migrate:
	npm run migration:generate init-auto-allocation-setting

start:
	npm run start:dev

print:
	echo "$(AWS_ECR_REPO):$(IMAGE_TAG) $(CI_ENVIRONMENT_SLUG)"

load:
	docker-compose -f ./loadtest/docker-compose.yml run --rm  k6 run /scripts/loadtest.js
