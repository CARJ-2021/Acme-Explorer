resource "aws_instance" "machine01" {
  ami                         = "ami-007fae589fdf6e955" // "ami-2757f631"
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.sg_acme.id]

  root_block_device {
    volume_size = 20 #20 Gb
  }

  tags = {
    Name        = "${var.author}.machine04"
    Author      = var.author
    Date        = "2021.03.27"
    Environment = "LAB"
    Location    = "Paris"
    Project     = "Acme Explorer"
  }

  connection {
    type        = "ssh"
    host        = self.public_ip
    user        = "ec2-user"
    private_key = file(var.key_path)
  }

  provisioner "file" {
    source      = "../docker"
    destination = "/home/ec2-user"
  }

  provisioner "file" {
    content     = <<EOF
{
    "log-driver": "awslogs",
    "log-opts": {
      "awslogs-group": "docker-logs-test",
      "tag": "{{.Name}}/{{.ID}}"
    }
}
EOF
    destination = "/home/ec2-user/daemon.json"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y docker httpd-tools",
      "sudo usermod -a -G docker ec2-user",
      "sudo curl -L https://github.com/docker/compose/releases/download/1.22.0-rc2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose",
      "sudo chmod +x /usr/local/bin/docker-compose",
      "sudo chkconfig docker on",
      "sudo service docker start",
    ]
  }

  provisioner "remote-exec" {
    inline = [
      "docker network create dev-network",
      "docker network create prod-network",
      "docker run -d -p 80:80 -v '/home/ec2-user/docker:/etc/nginx' --name nginx-proxy nginx",
      "export NODE_ENV=development",
      "docker volume create --name=logsvol",
      "export PORT=8001",
      "export DBPORT=27018",
      "export FRONT_PORT=3000",
      "export DBNAME=Acme-explorer",
      "export DBHOST=mongo",
      "docker-compose -f 'docker/docker-compose.dev.yaml' -p dev up -d",
      "docker-compose -f 'docker/docker-compose.prod.yaml' -p prod up -d",
      "sleep 10",
      "docker network connect prod-network nginx-proxy",
      "docker network connect dev-network nginx-proxy",
      "docker start nginx-proxy",

    ]
  }


}
