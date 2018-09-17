
pipeline {
    agent any
    stages {
        stage('Prepare') {
            parallel {
                stage ('Checkout') {
					steps {
						checkout scm
						sh 'git submodule update --init'
						echo "My branch is: ${env.BRANCH_NAME}"
					}
				}
            }
        }
		stage('Build') {
            steps {
		        sh 'npm i --dev'
		        sh 'tsc'
            }
        }
	    stage('Packaging') {
		    steps {
		    	sh 'npm run package'
                sh 'node package.js'
                sh 'tar -zcvf release/linux-generic-ia32.tar.gz builds/kukilauncher-linux-ia32'
                sh 'tar -zcvf release/linux-generic-x64.tar.gz builds/kukilauncher-linux-x64'
                sh 'tar -zcvf release/linux-generic-arm64.tar.gz builds/kukilauncher-linux-arm64'
                sh 'tar -zcvf release/linux-generic-arm7l.tar.gz builds/kukilauncher-linux-armv7l'
		    }
	    }
        stage('Archiving') {
		    steps {
				archiveArtifacts artifacts: 'release/installer32/Setup.exe'
			    archiveArtifacts artifacts: 'release/installer64/Setup.exe'
                archiveArtifacts artifacts: 'release/debian/*.deb'
                archiveArtifacts artifacts: 'release/redhat/*.rpm'
                archiveArtifacts artifacts: 'release/linux-generic-ia32.tar.gz'
                archiveArtifacts artifacts: 'release/linux-generic-x64.tar.gz'
                archiveArtifacts artifacts: 'release/linux-generic-arm64.tar.gz'
                archiveArtifacts artifacts: 'release/linux-generic-arm7l.tar.gz'
		    }
	    }
    }
    post {
        always {
            sh 'tree'
            echo 'Done.'
            deleteDir() 
        }
        success {
            echo 'Sucess!'
        }
        unstable {
            echo 'Unstable.'
        }
        failure {
            echo 'Failed!'
        }
        changed {
            echo 'Files were changed.'
        }
    }
}
