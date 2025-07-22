import React from 'react';
import { MasterBlogIntegrationWizard } from './MasterBlogIntegrationWizard';

interface SmartBlogIntegrationWizardProps {
  className?: string;
}

export default function SmartBlogIntegrationWizard({ className }: SmartBlogIntegrationWizardProps) {
  return <MasterBlogIntegrationWizard className={className} />;
}