'use client';
import {TextField} from 'vanilla-starter/TextField';

export function isValidName(name: string) {
  return name.trim() !== '';
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface FieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NameField(props: FieldProps) {
  return (
    <TextField
      {...props}
      label="Name"
      isRequired
      validate={name => (isValidName(name) ? null : 'Enter a name for the project.')}
    />
  );
}

export function EmailField(props: FieldProps) {
  return (
    <TextField
      {...props}
      label="Email"
      description="Invite someone to work on the project with you."
      isRequired
      validate={email => (isValidEmail(email) ? null : 'Enter a valid email address.')}
    />
  );
}

interface SummaryProps {
  name: string;
  email: string;
}

export function Summary({name, email}: SummaryProps) {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--spacing-2) var(--spacing-4)',
        margin: 0
      }}>
      <dt>Name</dt>
      <dd style={{margin: 0}}>{name || 'None'}</dd>
      <dt>Member</dt>
      <dd style={{margin: 0}}>{email || 'None'}</dd>
    </dl>
  );
}
