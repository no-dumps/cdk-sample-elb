import * as cdk from '@aws-cdk/core';

// 使うモジュール
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';

export class ElbSampleStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a cluster
    const vpc = new ec2.Vpc(this, 'cdk-sample-vpc', { maxAzs: 2 });

    const cluster = new ecs.Cluster(this, 'cdk-sample-cluster', { vpc });
    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      )
    });

    // Create Task Definition
    const taskDefinition = new ecs.Ec2TaskDefinition(
      this,
      'cdk-sample-taskDef'
    );
    const container = taskDefinition.addContainer('web', {
      image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      memoryLimitMiB: 256
    });

    container.addPortMappings({
      containerPort: 80,
      hostPort: 8080,
      protocol: ecs.Protocol.TCP
    });

    // Create Service
    const service = new ecs.Ec2Service(this, 'cdk-sample-service', {
      cluster,
      taskDefinition
    });

    // Create ALB
    const lb = new elb.ApplicationLoadBalancer(this, 'cdk-sample-elb', {
      vpc,
      internetFacing: true
    });
    const listener = lb.addListener('PublicListener', { port: 80, open: true });

    // Attach ALB to ECS Service
    listener.addTargets('ECS', {
      port: 80,
      targets: [
        service.loadBalancerTarget({
          containerName: 'web',
          containerPort: 80
        })
      ],
      // include health check (default is none)
      healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: '/health',
        timeout: cdk.Duration.seconds(5)
      }
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: lb.loadBalancerDnsName
    });
  }
}
