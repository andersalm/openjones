import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Alert, AlertContainer } from './Alert';

describe('Alert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders info alert by default', () => {
    render(<Alert>Test alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test alert message')).toBeInTheDocument();
    expect(screen.getByText('[i]')).toBeInTheDocument();
  });

  it('renders different alert types with correct icons', () => {
    const { rerender } = render(<Alert type="success">Success message</Alert>);
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('[✓]')).toBeInTheDocument();

    rerender(<Alert type="warning">Warning message</Alert>);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('[!]')).toBeInTheDocument();

    rerender(<Alert type="error">Error message</Alert>);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('[X]')).toBeInTheDocument();
  });

  it('shows OK button when dismissible', () => {
    render(
      <Alert dismissible onDismiss={() => {}}>
        Dismissible alert
      </Alert>
    );
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('hides OK button when not dismissible', () => {
    render(<Alert dismissible={false}>Non-dismissible alert</Alert>);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
  });

  it('calls onDismiss when OK button clicked', () => {
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismissible alert
      </Alert>
    );

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after specified time', async () => {
    const onDismiss = vi.fn();
    render(
      <Alert autoDismiss={2000} onDismiss={onDismiss}>
        Auto-dismiss alert
      </Alert>
    );

    expect(screen.getByText('Auto-dismiss alert')).toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  it('does not auto-dismiss when autoDismiss is 0', () => {
    const onDismiss = vi.fn();
    render(
      <Alert autoDismiss={0} onDismiss={onDismiss}>
        No auto-dismiss
      </Alert>
    );

    vi.advanceTimersByTime(5000);

    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByText('No auto-dismiss')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(
      <Alert style={{ backgroundColor: 'purple', padding: '20px' }}>
        Custom styled alert
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ backgroundColor: 'purple', padding: '20px' });
  });

  it('hides alert when dismissed', () => {
    render(
      <Alert dismissible onDismiss={() => {}}>
        Dismissible alert
      </Alert>
    );

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);

    // Alert should not be visible
    expect(screen.queryByText('Dismissible alert')).not.toBeInTheDocument();
  });

  it('applies Win95 pressed effect on button mousedown', () => {
    render(
      <Alert dismissible onDismiss={() => {}}>
        Test alert
      </Alert>
    );

    const button = screen.getByLabelText('Dismiss alert');
    const initialTransform = button.style.transform;

    fireEvent.mouseDown(button);
    expect(button.style.transform).toBe('translate(1px, 1px)');

    fireEvent.mouseUp(button);
    expect(button.style.transform).toBe('none');
  });
});

describe('AlertContainer', () => {
  it('renders children', () => {
    render(
      <AlertContainer>
        <Alert>Alert 1</Alert>
        <Alert>Alert 2</Alert>
      </AlertContainer>
    );

    expect(screen.getByText('Alert 1')).toBeInTheDocument();
    expect(screen.getByText('Alert 2')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(
      <AlertContainer style={{ top: '100px', right: '50px' }}>
        <Alert>Alert in container</Alert>
      </AlertContainer>
    );

    const alertContainer = container.firstChild as HTMLElement;
    expect(alertContainer).toHaveStyle({ top: '100px', right: '50px' });
  });

  it('stacks multiple alerts vertically', () => {
    render(
      <AlertContainer>
        <Alert type="info">Info alert</Alert>
        <Alert type="success">Success alert</Alert>
        <Alert type="error">Error alert</Alert>
      </AlertContainer>
    );

    expect(screen.getByText('Info alert')).toBeInTheDocument();
    expect(screen.getByText('Success alert')).toBeInTheDocument();
    expect(screen.getByText('Error alert')).toBeInTheDocument();
  });
});
