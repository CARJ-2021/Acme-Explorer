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
    source      = "../docker-compose.yaml"
    destination = "/home/ec2-user/docker-compose.yaml"
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
      "docker network create service-tier",
      "docker run -d -p 80:80 --name nginx-proxy -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy",
      "docker network connect service-tier nginx-proxy",
      "docker volume create --name=logsvol"
    ]
  }

  provisioner "remote-exec" {
    inline = [
      "export BASE_SITE=do2021.com",
      "export NODE_ENV=development",
      "docker network connect service-tier nginx-proxy",
      "docker volume create --name=logsvol",
      "export NODE_ENV=development",
      "export PORT=8001",
      "export DBPORT=27018",
      "export FRONT_PORT=3000",
      "export DBNAME=Acme-explorer",
      "export DBHOST=mongo",
      "echo 'dbport'",
      "echo $DBPORT",
      "export VIRTUAL_HOST=$NODE_ENV.$BASE_SITE",
      "echo 'VIRTUAL_HOST'",
      "echo $VIRTUAL_HOST",
      "docker-compose -p $VIRTUAL_HOST up -d"
    ]
  }

}
